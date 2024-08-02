import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Constants for the attractor
const RHO = 28;
const SIGMA = 10;
const BETA = 8 / 3;

// Constants for the simulation
const NUMLINES = 3;
const MAXPOINTSPERLINE = 10000; // Maximum number of points in the attractor line
const dt = 0.01 // Timestep (Controls the granularity of the trajectories)

const delta = function (r, dt) {
  // Given a position vector, calculate the change in that vector 
  // according to the Lorenz differential equations
  const dxdt = SIGMA * (r.y - r.x);
  const dydt = r.x * (RHO - r.z) - r.y;
  const dzdt = r.x * r.y - BETA * r.z;
  return new THREE.Vector3(dxdt, dydt, dzdt).multiplyScalar(dt);
};

const newPos = function (pos, dt) {
  // Given a position vector, return an updated one according to the
  // Lorenz differential equations
  const dp = delta(pos, dt);
  return pos.clone().add(dp);
};

// Setup the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 130);

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

const LINES = []; // Contains a dictionary enrtries with the details for every line
const LINECOLORS = [0xff0000, 0x00ff00, 0x0000ff];
// Initial displacement vectors.
const r0s = [
  new THREE.Vector3(0.01, 0, 0),
  new THREE.Vector3(0, 5, 5),
  new THREE.Vector3(0.0, 5, 0),
];


for (let lineIndex = 0; lineIndex < NUMLINES; lineIndex++) {
  // A dictionary storing all information about the line
  const lineDict = {};
  // Add line and leading point materials
  // TODO: Add proper methods for color generation
  const lineMaterial = new THREE.LineBasicMaterial({ color: LINECOLORS[lineIndex] });
  const pointMaterial = new THREE.PointsMaterial({
    color: LINECOLORS[(lineIndex + 1) % LINECOLORS.length],
    size: 5,
    sizeAttenuation: false,
  });
  lineDict['lineMaterial'] = lineMaterial;
  lineDict['pointMaterial'] = pointMaterial;

  // Prepopulate the line's buffer geometry, since resizing is costly
  const r0 = r0s[lineIndex]; // Initial condition
  const points = [];
  for (let i = 0; i < MAXPOINTSPERLINE; i++) {
    points.push(r0);
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  lineDict['points'] = points;
  lineDict['lineGeometry'] = lineGeometry;

  // Create a line and and add it to the scene
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);
  lineDict['line'] = line;


  LINES.push(lineDict);
}

//// Add the leading point as a colored one
//let pointPosition = points[points.length - 1];
//const pointGeometry = new THREE.BufferGeometry();
//pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPosition.toArray(), 3));
//const point = new THREE.Points(pointGeometry, pointMaterial);
//scene.add(point);

const animateInterval = 1; // The time (in ms) between every animation frame
const numRepeats = 1; // How often to update the simulation per animation frame

let lastTime = 0;
const animate = function (time) {
  if (time - lastTime > animateInterval) {
    for (let i = 0; i < numRepeats; i++) {
      for (let lineIndex = 0; lineIndex < NUMLINES; lineIndex++) {
        // Get data for a specific line
        const lineDict = LINES[lineIndex];
        const points = lineDict['points'];
        const lineGeometry = lineDict['lineGeometry'];

        const current_pos = points[points.length - 1];
        points.push(newPos(current_pos, dt));
        points.shift(); // Remove the oldest point

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
