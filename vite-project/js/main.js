import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import {math} from './math.js';

// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// const firebaseConfig = {
// 	apiKey: "AIzaSyCDjeMG_reJ8seJ3CJQRX34K1y2eWGa2lo",
// 	authDomain: "wapl3d.firebaseapp.com",
// 	projectId: "wapl3d",
// 	storageBucket: "wapl3d.appspot.com",
// 	messagingSenderId: "645651849138",
// 	appId: "1:645651849138:web:0003eef9b1466fe5758eab",
// 	measurementId: "G-F2FR3MGK8W"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 20000 );

const renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true});
// renderer.preserveDrawingBuffer = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Create a DirectionalLight and turn on shadows for the light
let light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 500, 500, 0 ); //default; light shining from top
light.castShadow = true; // default false
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 500.0;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 10000.0;
light.shadow.camera.left = 500;
light.shadow.camera.right = -500;
light.shadow.camera.top = 500;
light.shadow.camera.bottom = -500;
scene.add(light);

// const helper = new THREE.DirectionalLightHelper( light, 5 );
// scene.add( helper );

light = new THREE.AmbientLight(0x909090);
scene.add(light);

const texture = new THREE.TextureLoader().load('https://storage.googleapis.com/wapl3d.appspot.com/textures/WAPL_2022_raster_1m.jpg');
texture.colorSpace = THREE.SRGBColorSpace;

const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(785, 576, 512, 512),
	new THREE.MeshStandardMaterial({
		// color: '#808080',
		// wireframe: true,
		side: THREE.DoubleSide,
		map: texture
	  })
);
plane.castShadow = true;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Modify one vertice
// const vertices = plane.geometry.attributes.position.array
// for (var i = 0; i <= vertices.length; i += 3) {
// 	let vx = vertices[i];
// 	let vy = vertices[i+1];
// 	if (vx == -393 && vy == 288.5) {
// 		vertices[i+2] = 64.0;
// 	} else {
// 		vertices[i+2] = 0.0;
// 	}
// }

// Modify Vertice with a Bump
// const vertices = plane.geometry.attributes.position.array
// for (var i = 0; i <= vertices.length; i += 3) {
// 	let vx = vertices[i];
// 	let vy = vertices[i+1];
// 	const dist = new THREE.Vector2(vx, vy).distanceTo(new THREE.Vector2(0, 0));
// 	let h = Math.min(Math.max((dist/300), 0.0), 1.0);
// 	h = h * h * h * (h * (h * 6 - 15) + 10);
// 	h = h*64.0;
// 	vertices[i+2] = h
// }

// Modify vertices with Height Map
const img1 = new Image(); // Image constructor
// img1.crossOrigin = "anonymous";
// img1.alt = "height map";
img1.src = "https://storage.googleapis.com/wapl3d.appspot.com/textures/WAPL_2022_heightmap_1m.png";
img1.setAttribute('crossOrigin', 'anonymous');
// img1.crossOrigin = "Anonymous";

function _GetPixelAsFloat(x, y, dataImg) {
	const position = (x + dataImg.width * y) * 4;
	// console.log(position);
	const data = dataImg.data;
	return data[position] / 255.0;
}

function _GetImageData(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
	// console.log("image width: "+image.width);
	// console.log("image height: "+image.height);

    const ctx = canvas.getContext( '2d' );
    ctx.drawImage(image, 0, 0);

	ctx.drawImage(image, 0, 0);
	const data = ctx.getImageData(0, 0, image.width, image.height);
	// console.log(data.data);
	return data;
}

window.addEventListener("load", function() { 
	const dataImg = _GetImageData(img1);

	const vertices = plane.geometry.attributes.position.array
	for (var i = 0; i <= vertices.length; i += 3) {
		let vx = vertices[i];
		let vy = vertices[i+1];

		// Bilinear filter
		const offset = new THREE.Vector2(-392.5, -288);
		const dimensions = new THREE.Vector2(785, 576);

		const xf = math.sat((vx - offset.x) / dimensions.x);
		const yf = 1.0 - math.sat((vy - offset.y) / dimensions.y);
		const w = img1.width - 1;
		const h = img1.height - 1;

		const x1 = Math.floor(xf * w);
		const y1 = Math.floor(yf * h);
		const x2 = math.clamp(x1 + 1, 0, w);
		const y2 = math.clamp(y1 + 1, 0, h);

		const xp = xf * w - x1;
		const yp = yf * h - y1;

		const p11 = _GetPixelAsFloat(x1, y1, dataImg);
		const p21 = _GetPixelAsFloat(x2, y1, dataImg);
		const p12 = _GetPixelAsFloat(x1, y2, dataImg);
		const p22 = _GetPixelAsFloat(x2, y2, dataImg);

		const px1 = math.lerp(xp, p11, p21);
		const px2 = math.lerp(xp, p12, p22);
		// console.log(math.lerp(yp, px1, px2) * 100);
		vertices[i+2] = math.lerp(yp, px1, px2) * 100;
		// if (vx == 392.5 && vy == 288) {
		// } else {
		// 	vertices[i+2] = 0.0;
		// }
	}
	plane.geometry.attributes.position.needsUpdate = true;
	plane.geometry.computeVertexNormals();
});

// this works
// window.addEventListener("load", function() { 
// 	const dataImg = _GetImageData(img1);
// 	const vertices = plane.geometry.attributes.position.array
// 	for (var i = 0; i <= vertices.length; i += 3) {
// 		let vx = vertices[i];
// 		let vy = vertices[i+1];
// 		if (vx == -393 && vy == 288.5) {
// 			// console.log(data);
// 			const position = (vx + dataImg.width * vy) * 4;
// 			const dataImageData = dataImg.data;
// 			const result = dataImageData[position] / 255.0;
// 			console.log(result);
// 			vertices[i+2] = result;
// 		} else {
// 			vertices[i+2] = 0.0;
// 		}
// 	}
// 	plane.geometry.attributes.position.needsUpdate = true;
// 	plane.geometry.computeVertexNormals();
// });


// const peak = 50;
// const vertices = plane.geometry.attributes.position.array
// console.log(vertices);
// for (var i = 0; i <= vertices.length; i += 3) {
//     vertices[i+2] = peak * Math.random();
// }
// plane.geometry.attributes.position.needsUpdate = true;
// plane.geometry.computeVertexNormals();

// const vertices = plane.geometry.attributes.position.array
// for (var i = 0; i <= vertices.length; i += 3) {
// 	vertices[i+2] = Math.random() * 20;
// }
// plane.geometry.attributes.position.needsUpdate = true;
// plane.geometry.computeVertexNormals();

// const vertices = plane.geometry.attributes.position.array
// for (var i = 0; i <= vertices.length; i += 3) {
// 	let vx = vertices[i];
// 	let vz = vertices[i+2];
// 	let dist = new THREE.Vector2(vx, vz).distanceTo(new THREE.Vector2(0, 0));
// 	let h = 1.0 - (dist / 250);
// 	vertices[i+2] = h * h * h * (h * (h * 6 - 15) + 10);
// }
// plane.geometry.attributes.position.needsUpdate = true;
// plane.geometry.computeVertexNormals();

// for (each vertex of plane.vertices) {
// 	dist = vec2(v.x, v.z).distanceTo(vec(0,0));
// 	h = 1.0 - Math.sat(dist / 250);
// 	h = h * h * h * (h * (h * 6 - 15) + 10);
// }


const cube = new THREE.Mesh(
	new THREE.BoxGeometry( 10, 10, 10 ),
	new THREE.MeshStandardMaterial({
		color: 0xFF0000,
	  })	
);
cube.position.set(0, 100, 50);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add( cube );

const torusKnot = new THREE.Mesh(
	new THREE.TorusKnotGeometry(10, 4, 100, 16),
	new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
torusKnot.position.set(0, 40, 25);
torusKnot.castShadow = true;
torusKnot.receiveShadow = true;
scene.add(torusKnot)

const dotPoints = [];
dotPoints.push( new THREE.Vector3( -392.5, 0, 0 ) );
dotPoints.push( new THREE.Vector3( -392.5, 0, -288 ) );

const dotGeometry = new THREE.BufferGeometry().setFromPoints( dotPoints );
const dotMaterial = new THREE.PointsMaterial( { color: 0x0000ff, size: 10, sizeAttenuation: false } );

const dotDummy = new THREE.Points( dotGeometry, dotMaterial );

// ref points

scene.add(dotDummy);

const loader = new THREE.CubeTextureLoader();
const textureCube = loader.load([
	'https://storage.googleapis.com/wapl3d.appspot.com/cubemap/px.png',
	'https://storage.googleapis.com/wapl3d.appspot.com/cubemap/nx.png',
	'https://storage.googleapis.com/wapl3d.appspot.com/cubemap/py.png',
	'https://storage.googleapis.com/wapl3d.appspot.com/cubemap/ny.png',
	'https://storage.googleapis.com/wapl3d.appspot.com/cubemap/pz.png',
	'https://storage.googleapis.com/wapl3d.appspot.com/cubemap/nz.png',
]);
scene.background = textureCube;

//Create a helper for the shadow camera (optional)
// const helper = new THREE.CameraHelper( light.shadow.camera );
// scene.add( helper );

// important!
const controls = new OrbitControls( camera, renderer.domElement );

// const controls = new FirstPersonControls( camera, renderer.domElement);
// controls.movementSpeed = 150;
// controls.lookSpeed = 0.1;

// controls.keys = {
// 	LEFT: 'ArrowLeft', //left arrow
// 	UP: 'ArrowUp', // up arrow
// 	RIGHT: 'ArrowRight', // right arrow
// 	BOTTOM: 'ArrowDown' // down arrow
// };

// controls.mouseButtons = {
// 	LEFT: THREE.MOUSE.PAN,
// 	MIDDLE: THREE.MOUSE.DOLLY,
// 	RIGHT: THREE.MOUSE.ROTATE
// }

// panOffset.set(te[8],0,te[10]);

// var panFront = function() {

//     let v = new THREE.Vector3();

//     return function panFront( distance, objectMatrix ) {

//         v.setFromMatrixColumn( objectMatrix, 2 ); // get Z column of objectMatrix
//         v.y = 0;

//         v.multiplyScalar( -distance );

//         panOffset.add( v );
//     };

// }();

camera.position.z = 0;
camera.position.y = 250;
controls.update();

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

animate();

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// const renderer = new THREE.WebGLRenderer();
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );

// const controls = new OrbitControls( camera, renderer.domElement );

// //Create a DirectionalLight and turn on shadows for the light
// let light = new THREE.DirectionalLight( 0xffffff, 1 );
// light.position.set( 10, 100, -5 );
// light.target.position.set(0,-100,0);
// light.castShadow = true;
// light.shadow.bias = -0.1;
// light.shadow.mapSize.width = 2048;
// light.shadow.mapSize.height = 2048;
// light.shadow.camera.near = 1.0;
// light.shadow.camera.far = 500;
// light.shadow.camera.left = 200;
// light.shadow.camera.right = -200;
// light.shadow.camera.top = 200;
// light.shadow.camera.bottom = 500;
// scene.add(light);

// // light = new THREE.AmbientLight(0x404040);
// // scene.add(light);

// // Directional Light Helper
// let helper = new THREE.DirectionalLightHelper(light, 5);
// light.add(helper);

// //Create a helper for the shadow camera (optional)
// // const helper = new THREE.CameraHelper( light.shadow.camera );
// // scene.add( helper );

// // const groundMat = new THREE.MeshStandardMaterial({
// //     color: 0xffffff,
// //     wireframe: false,
// //     displacementMap: heightMap,
// //     displacementScale: 10
// // });
// // const groundMat = new THREE.MeshBasicMaterial({
// //     color: 0xBF9000,
// //     wireframe: true
// // });
// // const groundMesh = new THREE.Mesh(groundGeo, groundMat);
// // groundMesh.rotation.x = -Math.PI / 2;
// // groundMesh.castShadow = true; //default is false
// // groundMesh.receiveShadow = false; //default
// // scene.add(groundMesh);
// // groundMesh.position.set(0, -10, 0);


// const geometryPlane = new THREE.PlaneGeometry(500, 500, 10, 10);
// // geometryPlane.addAttribute('position', new THREE.BufferAttribute(points, 3));
// const materialPlane = new THREE.MeshBasicMaterial( {color: 0xBF9000, wireframe: false, side: THREE.DoubleSide} );
// const plane = new THREE.Mesh( geometryPlane, materialPlane );
// plane.rotation.x = -Math.PI / 2;
// plane.castShadowShadow = true;
// scene.add( plane );
// plane.position.set(0, -10, 0);

// const peak = 60;
// // const vertices = geometryPlane.attributes.position.array;
// const vertices = plane.geometry.attributes.position.array
// console.log(vertices);
// for (var i = 0; i <= vertices.length; i += 3) {
//     vertices[i+2] = peak * Math.random();
// }
// plane.geometry.attributes.position.needsUpdate = true;
// plane.geometry.computeVertexNormals();

// const geometry = new THREE.BoxGeometry( 10, 10, 10 );
// const material = new THREE.MeshBasicMaterial( { color: 0xFF0000} );
// const cube = new THREE.Mesh( geometry, material );
// cube.position.set(0, 50, 20);
// cube.castShadow = true;
// cube.receiveShadow = true;
// scene.add( cube );

// // const positionAttribute = plane.geometry.getAttribute( 'position' );

// // for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {

// // 	vertex.fromBufferAttribute( positionAttribute, vertexIndex );

// // 	// do something with vertex

// // }

// // vertices.forEach(function(v) {
// //     if (v.x == 250 && v.z == 250) {
// //         v.y = 64.0;
// //     } else {
// //         v.y = 0.0
// //     }
// // })

// // geometryPlane.vertices.forEach( v => { v.z = noiseFunction( v.x, v.y ); } )

// // modifyVertices() {
// //     for (each vertex of geometryPlane.vertices) {
// //         // make one corner really high
// //         if (v.x == 250 && v.z == 250) {
// //             v.y = 64.0;
// //         } else {
// //             v.y = 0.0
// //         }
// //     }
// // }

// camera.position.z = 400;
// camera.position.y = 250;
// controls.update();

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// function animate() {
// 	requestAnimationFrame( animate );
// 	renderer.render( scene, camera );
// }
// animate();