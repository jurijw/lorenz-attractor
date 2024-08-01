
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const pointMaterial = new THREE.PointsMaterial({
  color: 0x3300ff,
  size: 5,
  sizeAttenuation: false,
})

const rho = 28;
const sigma = 10;
const beta = 8 / 3;
const dt = 0.01;
const maxPoints = 30000; // Maximum number of points in the attractor line

const delta = function (pos) {
  const dx = sigma * (pos.y - pos.x);
  const dy = pos.x * (rho - pos.z) - pos.y;
  const dz = pos.x * pos.y - beta * pos.z;
  return new THREE.Vector3(dx, dy, dz);
};

const newPos = function (pos) {
  const dp = delta(pos).multiplyScalar(dt);
  return pos.clone().add(dp);
};

const pos0 = new THREE.Vector3(0.01, 0, 0); // Initial condition
let points = [pos0, newPos(pos0)];

const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

// Add the leading point as a colored one
let pointPosition = points[points.length - 1];
const pointGeometry = new THREE.BufferGeometry();
pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPosition.toArray(), 3));
const point = new THREE.Points(pointGeometry, pointMaterial);
scene.add(point);

let numRepeats = 1;
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

// Resize correctly when window size changes
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
