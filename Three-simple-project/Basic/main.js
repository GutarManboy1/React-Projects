// import * as THREE from 'three';

// //1. Create the Scene
// const scene = new THREE.Scene();
// scene.background = new THREE.Color('#F0F0F0');

// //2. Add the Camera
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); //FOV field of view camera with a value of 75, next it aspect ratio is divided by the window's height and width. finally how close and how far the camera is
// camera.position.z = 5;

// //3. Create and add the cube or whatever object
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshLambertMaterial({color: '#468585' ,emissive:'#468585'}); //the emissive default color is set to black. if i dont add the color then the color will not react with the lighting!!!

// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// //4. Add Lighting
// const light = new THREE.DirectionalLight(0x9CDBA6, 10 ); //now that the cube has been created and the mesh has been layered onto it, we add light. 0x is needed to bring in the color of light. the number that follows the 0x is the light value. next is the intensity of the light with a value of 10
// light.position.set(1, 1, 1) // set where you want the light to be. x, y, and z axis
// scene.add(light);

// //5. Set up the Renderer
// const renderer = new THREE.WebGLRenderer(); //now that everything has been set up it is time to call in the renderer which will make all things visible.
// renderer.setSize(window.innerWidth, window.innerHeight); // this makes sure that the renderer is displaying everything in the window 
// document.body.appendChild(renderer.domElement); //this adds the element to the DOM tree

// //6. Animate the Scene
// renderer.render(scene, camera); //call the renderer and render it(pass in the scene and the camera)

// //REMEMBER THIS!!! EVERYTHING THAT COMES AFTER THREE.  STARTS WITH A CAPITAL LETTER EX. THREE.BoxGeometry, THREE.MESH....

import * as THREE from 'three';

// 1. Create the Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#F0F0F0');

// 2. Add the Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 3. Create and add the cube or object
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial({ color: '#468585', emissive: '#468585' });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 4. Add Lighting
const light = new THREE.DirectionalLight(0x9CDBA6, 10);
light.position.set(1, 1, 1);
scene.add(light);

// 5. Set up the Renderer
const renderer = new THREE.WebGLRenderer(); // Corrected typo from WebGLRender to WebGLRenderer
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 6. Animate the Scene
function animate(){
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera); // Call the renderer and pass in the scene and camera  pass the render into the function and finally call the animation function outside of the curly brackets
}

animate(); // here animate is called 
