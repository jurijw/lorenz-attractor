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

const rho = 28;
const sigma = 10;
const beta = 8 / 3;

// function delta(pos, dt) {
//   let dx = sigma * (pos.y - pos.x) * dt;
//   let dy = (pos.x * (rho - pos.z) - pos.y) * dt;
//   let dz = (pos.x * pos.y - beta * pos.z) * dt;
//   return new THREE.Vector3(dx, dy, dz);
// }

const pos0 = new THREE.Vector3(0, 0, 0);
const pos1 = new THREE.Vector3(10, 0, 0);
const points = [pos0, pos1];

const curve = new THREE.CatmullRomCurve3(points);
const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));

const line = new THREE.Line(geometry, material);
scene.add(line);

const animate = function () {
  points.push(points[points.length - 1].clone().add(new THREE.Vector3(1, 0, 0)));

  curve.points = points;
  const newPoints = curve.getPoints(50);
  line.geometry.setFromPoints(newPoints);


  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
// renderer.setAnimationLoop(animate);
requestAnimationFrame(animate);
