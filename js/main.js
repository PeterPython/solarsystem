import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create planets
const planets = [
  { name: 'Mercury', color: 0x8c8c8c, distance: 10, period: 88 },
  { name: 'Venus', color: 0xffd700, distance: 15, period: 225 },
  { name: 'Earth', color: 0x4169e1, distance: 20, period: 365 },
  { name: 'Mars', color: 0xff4500, distance: 30, period: 687 },
  { name: 'Jupiter', color: 0xffa500, distance: 50, period: 4333 },
  { name: 'Saturn', color: 0xffd700, distance: 70, period: 10759 },
  { name: 'Uranus', color: 0x40e0d0, distance: 90, period: 30687 },
  { name: 'Neptune', color: 0x0000ff, distance: 110, period: 60190 }
];

planets.forEach(planet => {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: planet.color });
  const obj = new THREE.Mesh(geometry, material);
  obj.position.set(planet.distance, 0, 0);
  planet.obj = obj;
  scene.add(obj);
});

let time = 0;

function animate() {
  requestAnimationFrame(animate);

  planets.forEach(planet => {
    planet.obj.rotation.y += 0.01;
    planet.obj.position.x = Math.cos(time / planet.period) * planet.distance;
    planet.obj.position.z = Math.sin(time / planet.period) * planet.distance;
  });

  sun.rotation.y += 0.01;

  time += 0.1;
  renderer.render(scene, camera);
}

animate();
