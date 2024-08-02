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
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = true;
controls.maxPolarAngle = 2 * Math.PI; // TODO: Does this even do anything?
controls.autoRotate = true;
controls.autoRotateSpeed = 1;

// Setup the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Constants for the attractor
const RHO = 28;
const SIGMA = 10;
const BETA = 8 / 3;
// Constants for the simulation
const NUMLINES = 3;
const MAXPOINTSPERLINE = 60000; // Maximum number of points in the attractor line
const dt = 0.01 // Timestep

const LINECOLORS = [0xff0000, 0x00ff00, 0x0000ff];

const LINEMATERIALS = [];
const POINTMATERIALS = [];
for (let i = 0; i < NUMLINES; i++) {
  // Configure the line and leading point materials
  LINEMATERIALS.push(new THREE.LineBasicMaterial({ color: LINECOLORS[i] }));
  POINTMATERIALS.push(new THREE.PointsMaterial({
    color: LINECOLORS[(i + 1) % LINECOLORS.length],
    size: 5,
    sizeAttenuation: false,
  }));
}


const delta = function (pos, dt) {
  // Given a position vector, calculate the change in that vector 
  // according to the Lorenz differential equations
  const dx = SIGMA * (pos.y - pos.x);
  const dy = pos.x * (RHO - pos.z) - pos.y;
  const dz = pos.x * pos.y - BETA * pos.z;
  return new THREE.Vector3(dx, dy, dz).multiplyScalar(dt);
};

const newPos = function (pos, dt) {
  // Given a position vector, return an updated one according to the
  // Lorenz differential equations
  const dp = delta(pos, dt);
  return pos.clone().add(dp);
};

// Initial displacement vectors.
const r0s = [
  new THREE.Vector3(0.01, 0, 0),
  new THREE.Vector3(0, 5, 5),
  new THREE.Vector3(0.0, 5, 0),
];

const ALLPOINTS = [];
const ALLLINEGEOMETRIES = [];
const ALLLINES = [];
for (let i = 0; i < NUMLINES; i++) {
  let r0_i = r0s[i]; // Initial condition
  // Prefill the point array, so that the bufferGeometry has the correct size
  // at instantiation (resizing is costly)

  let points_i = [];
  for (let j = 0; j < MAXPOINTSPERLINE; j++) {
    points_i.push(r0_i);
  }
  ALLPOINTS.push(points_i);

  const lineGeometry_i = new THREE.BufferGeometry().setFromPoints(points_i);
  const lineMaterial_i = LINEMATERIALS[i];
  const line_i = new THREE.Line(lineGeometry_i, lineMaterial_i);
  scene.add(line_i);
  ALLLINEGEOMETRIES.push(lineGeometry_i);
  ALLLINES.push(line_i);
}


//// Add the leading point as a colored one
//let pointPosition = points[points.length - 1];
//const pointGeometry = new THREE.BufferGeometry();
//pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPosition.toArray(), 3));
//const point = new THREE.Points(pointGeometry, pointMaterial);
//scene.add(point);

let numRepeats = 1;
let lastTime = 0; // ms
const animate = function (time) {
  if (time - lastTime > 1) {
    for (let i = 0; i < numRepeats; i++) {
      for (let lineIndex = 0; lineIndex < NUMLINES; lineIndex++) {
        // Get data for a specific line
        const points = ALLPOINTS[lineIndex];
        const lineGeometry = ALLLINEGEOMETRIES[lineIndex];

        const current_pos = points[points.length - 1];
        points.push(newPos(current_pos, dt));
        if (points.length > MAXPOINTSPERLINE) { // TODO: Can we get rid of if since we are prepopulating arrays?
          points.shift(); // Remove the oldest point
        }

        // Update geometry with new points
        lineGeometry.setFromPoints(points);

        // // Update leading point
        // pointGeometry.attributes.position.set(points[points.length - 1].toArray());
        // pointGeometry.attributes.position.needsUpdate = true;

        lastTime = time;
      }
    }
  }

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
