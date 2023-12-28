import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );

//Create a DirectionalLight and turn on shadows for the light
const light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 0, 200, 0 ); //default; light shining from top
light.castShadow = true; // default false
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default

//Create a helper for the shadow camera (optional)
const helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );

// const groundMat = new THREE.MeshStandardMaterial({
//     color: 0xffffff,
//     wireframe: false,
//     displacementMap: heightMap,
//     displacementScale: 10
// });
// const groundMat = new THREE.MeshBasicMaterial({
//     color: 0xBF9000,
//     wireframe: true
// });
// const groundMesh = new THREE.Mesh(groundGeo, groundMat);
// groundMesh.rotation.x = -Math.PI / 2;
// groundMesh.castShadow = true; //default is false
// groundMesh.receiveShadow = false; //default
// scene.add(groundMesh);
// groundMesh.position.set(0, -10, 0);


const geometryPlane = new THREE.PlaneGeometry(500, 500, 10, 10);
// geometryPlane.addAttribute('position', new THREE.BufferAttribute(points, 3));
const materialPlane = new THREE.MeshBasicMaterial( {color: 0xBF9000, wireframe: false, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( geometryPlane, materialPlane );
plane.rotation.x = -Math.PI / 2;
plane.castShadowShadow = true;
scene.add( plane );
plane.position.set(0, -10, 0);

const peak = 60;
// const vertices = geometryPlane.attributes.position.array;
const vertices = plane.geometry.attributes.position.array
console.log(vertices);
for (var i = 0; i <= vertices.length; i += 3) {
    vertices[i+2] = peak * Math.random();
}
plane.geometry.attributes.position.needsUpdate = true;
plane.geometry.computeVertexNormals();


// const positionAttribute = plane.geometry.getAttribute( 'position' );

// for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {

// 	vertex.fromBufferAttribute( positionAttribute, vertexIndex );

// 	// do something with vertex

// }

// vertices.forEach(function(v) {
//     if (v.x == 250 && v.z == 250) {
//         v.y = 64.0;
//     } else {
//         v.y = 0.0
//     }
// })

// geometryPlane.vertices.forEach( v => { v.z = noiseFunction( v.x, v.y ); } )

// modifyVertices() {
//     for (each vertex of geometryPlane.vertices) {
//         // make one corner really high
//         if (v.x == 250 && v.z == 250) {
//             v.y = 64.0;
//         } else {
//             v.y = 0.0
//         }
//     }
// }

camera.position.z = 100;
camera.position.y = 100;
controls.update();

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();