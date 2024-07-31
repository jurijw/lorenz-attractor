import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

const material = new THREE.LineBasicMaterial({
  color: 0xffffff
});

let rho = 28;
let sigma = 10;
let beta = 8 / 3;

const pos = new THREE.Vector3(0, 0, 0);
function delta(pos, dt) {
  dx = sigma * (pos.y - pos.x) * dt;
  dy = (pos.x * (rho - pos.z) - pos.y) * dt;
  dz = (pos.x * pos.y - beta * pos.z) * dt;
  return new THREE.Vector3(dx, dy, dz);
}

const points = [];
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometry, material);

scene.add(line);

function animate() {
  new_pos = pos.clone() + delta(points[points.length - 1]);
  points.push(new_pos);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
