import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CAMERAZPOSITION = 100;
const ANIMATEINTERVAL = 1; // The time (in ms) between every animation frame

// Setup the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000); // TODO: Set clipping based on parameter choices
camera.position.set(0, 0, CAMERAZPOSITION);

// Configure camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = true;
controls.maxPolarAngle = 2 * Math.PI; // TODO: Does this even do anything?
controls.autoRotate = true;
controls.autoRotateSpeed = 1;

// Setup the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const generateAxisLine = function () {
  // Return an axis line with 
  let range = 80;
  let spacing = 10;
  let tickSize = 3;
  const axisMaterial = new THREE.LineBasicMaterial({
    'color': 0xffffff,
    'thickness': 5,
  });
  const points = [
    new THREE.Vector3(-range, 0, 0),
    new THREE.Vector3(range, 0, 0),
  ]
  const axisGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const axisLine = new THREE.Line(axisGeometry, axisMaterial);

  // Add little ticks in intervals
  for (let i = 0; i < range; i += spacing) {
    for (let sign = -1; sign <= 1; sign += 2) {
      const tickPositionAlongAxis = sign * i;
      const points = [
        new THREE.Vector3(tickPositionAlongAxis, -tickSize, 0),
        new THREE.Vector3(tickPositionAlongAxis, tickSize, 0),
        new THREE.Vector3(tickPositionAlongAxis, 0, 0),
        new THREE.Vector3(tickPositionAlongAxis, 0, -tickSize),
        new THREE.Vector3(tickPositionAlongAxis, 0, tickSize),
      ]
      const axisTickGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const axisTickLine = new THREE.Line(axisTickGeometry, axisMaterial);
      axisLine.add(axisTickLine);
    }
  }
  return axisLine;
}

const drawAxes = function (scene) {
}

// Add axis
scene.add(generateAxisLine());
scene.add(generateAxisLine().rotateZ(Math.PI / 2));
scene.add(generateAxisLine().rotateY(-Math.PI / 2));




const animate = function (time) {
  // if (time - lastTime > ANIMATEINTERVAL) {
  //
  // }

  // Update camera controls
  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

requestAnimationFrame(animate);


// Resize correctly when window size changes
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
