import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


// Setup the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);

// Configure camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = true;
controls.maxPolarAngle = Math.PI / 2;
// controls.autoRotate = true;
// controls.autoRotateSpeed = 10000;

// Setup the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Configure the line and leading point materials
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const pointMaterial = new THREE.PointsMaterial({
  color: 0x3300ff,
  size: 5,
  sizeAttenuation: false,
})

// Constants for the attractor
const rho = 28;
const sigma = 10;
const beta = 8 / 3;
// Constants for the simulation
const dt = 0.001;
const maxPoints = 30000; // Maximum number of points in the attractor line

const delta = function (pos, dt) {
  // Given a position vector, calculate the change in that vector 
  // according to the Lorenz differential equations
  const dx = sigma * (pos.y - pos.x);
  const dy = pos.x * (rho - pos.z) - pos.y;
  const dz = pos.x * pos.y - beta * pos.z;
  return new THREE.Vector3(dx, dy, dz);
};

const newPos = function (pos) {
  // Given a position vector, return an updated one according to the
  // Lorenz differential equations
  const dp = delta(pos).multiplyScalar(dt);
  return pos.clone().add(dp);
};

const pos0 = new THREE.Vector3(0.01, 0, 0); // Initial condition
// Prefill the point array, so that the bufferGeometry has the correct size
// at instantiation (resizing is costly)

let points = [];
for (let i = 0; i < maxPoints; i++) {
  points.push(pos0);
}
// let points = [pos0, newPos(pos0)];

const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

// Add the leading point as a colored one
let pointPosition = points[points.length - 1];
const pointGeometry = new THREE.BufferGeometry();
pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPosition.toArray(), 3));
const point = new THREE.Points(pointGeometry, pointMaterial);
scene.add(point);

let numRepeats = 10;
let lastTime = 0; // ms
const animate = function (time) {
  if (time - lastTime > 1) {
    for (let i = 0; i < numRepeats; i++) {
      const current_pos = points[points.length - 1];
      points.push(newPos(current_pos));
      if (points.length > maxPoints) {
        points.shift(); // Remove the oldest point
      }

      // Update geometry with new points
      lineGeometry.setFromPoints(points);

      // Update leading point
      pointGeometry.attributes.position.set(points[points.length - 1].toArray());
      pointGeometry.attributes.position.needsUpdate = true;

      lastTime = time;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

requestAnimationFrame(animate);

// Update camera controls
controls.update();

// Resize correctly when window size changes
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
