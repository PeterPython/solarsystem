// main.js - Updated Solar System Animation
import * as THREE from './three.module.js';
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

// Function to create orbit lines
function createOrbit(distance) {
    const orbitGeometry = new THREE.RingGeometry(distance - 0.05, distance + 0.05, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Rotate to lie flat
    scene.add(orbit);
}

// Initialize planets
const planets = {};
Object.keys(celestialData).forEach(name => {
    const planetData = celestialData[name];
    createOrbit(planetData.distance); // Add orbit lines
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

// Time and speed variables
let time = 0;
let timeSpeed = 1;

// Get the slider input element
const timeSpeedInput = document.getElementById('timeSpeed');

// Update the time speed based on slider value
if (timeSpeedInput) {
    timeSpeedInput.addEventListener('input', (event) => {
        timeSpeed = parseFloat(event.target.value);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate sun
    sun.rotation.y += 0.01;

    // Update planet positions based on time speed
    Object.values(planets).forEach(planet => {
        const angle = (time * timeSpeed / planet.period) * Math.PI * 2;
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
