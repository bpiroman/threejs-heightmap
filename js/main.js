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

light = new THREE.AmbientLight(0x909090);
scene.add(light);

const texture = new THREE.TextureLoader().load('https://storage.googleapis.com/wapl3d-legacy.appspot.com/textures/WAPL_2022_raster_1m.jpg');
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

// Modify vertices with Height Map
const img1 = new Image();
img1.src = "https://storage.googleapis.com/wapl3d-legacy.appspot.com/textures/WAPL_2022_heightmap_1m.png";
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

// important!
const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z = 0;
camera.position.y = 250;
controls.update();

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

animate();