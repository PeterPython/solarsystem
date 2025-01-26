// main.js - Updated Solar System Animation
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';
import { celestialData } from './celestial-data.js';
import { createPlanetTexture } from './texture-utils.js';
import { CameraController } from './camera-controls.js';


// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 150;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add sun
const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Initialize planets
const planets = {};
Object.keys(celestialData).forEach(name => {
    const planetData = celestialData[name];
    const geometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
    const texture = createPlanetTexture(10, 0.3, `#${planetData.color.toString(16).padStart(6, '0')}`);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(planetData.distance, 0, 0);
    scene.add(planet);
    planets[name] = { ...planetData, obj: planet };
});

// Camera controls
const cameraController = new CameraController(camera);

// Animation loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);

    // Rotate sun
    sun.rotation.y += 0.01;

    // Update planet positions
    Object.values(planets).forEach(planet => {
        const angle = (time / planet.period) * Math.PI * 2;
        planet.obj.position.x = Math.cos(angle) * planet.distance;
        planet.obj.position.z = Math.sin(angle) * planet.distance;
    });

    time += 0.1;

    // Update camera and render scene
    cameraController.update();
    renderer.render(scene, camera);
}

animate();

// Responsive resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
