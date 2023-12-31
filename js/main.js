// testing

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );

const renderer = new THREE.WebGLRenderer();
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
light.shadow.camera.far = 1000.0;
light.shadow.camera.left = 500;
light.shadow.camera.right = -500;
light.shadow.camera.top = 500;
light.shadow.camera.bottom = -500;
scene.add(light);

// const helper = new THREE.DirectionalLightHelper( light, 5 );
// scene.add( helper );

// light = new THREE.AmbientLight(0x909090);
// scene.add(light);

const texture = new THREE.TextureLoader().load('./textures/WAPL_2022_raster_1m.jpg');
texture.encoding = THREE.sRGBEncoding;
const heightMap = new THREE.TextureLoader().load('./textures/textures/WAPL_2022_heightmap_1m.png');
console.log(heightMap);

const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(786, 577, 20, 20),
	new THREE.MeshStandardMaterial({
		// color: '0x000000',
		side: THREE.DoubleSide,
		map: texture,
		// displacementMap: heightMap,
		// displacementScale: 10
	  })
);
plane.castShadow = true;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const peak = 50;
const vertices = plane.geometry.attributes.position.array
console.log(vertices);
for (var i = 0; i <= vertices.length; i += 3) {
    vertices[i+2] = peak * Math.random();
}
plane.geometry.attributes.position.needsUpdate = true;
plane.geometry.computeVertexNormals();

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

const loader = new THREE.CubeTextureLoader();
const textureCube = loader.load([
	'./textures/cubemap/px.png',
	'./textures/cubemap/nx.png',
	'./textures/cubemap/py.png',
	'./textures/cubemap/ny.png',
	'./textures/cubemap/pz.png',
	'./textures/cubemap/nz.png',
]);
scene.background = textureCube;

//Create a helper for the shadow camera (optional)
const helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );

const controls = new OrbitControls( camera, renderer.domElement );

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