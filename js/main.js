// main.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { createPlanetTexture, createGasGiantTexture } from './texture-utils.js';
import { celestialData, sunData } from './celestial-data.js';
import { CameraController } from './camera-controls.js';

let scene, camera, renderer;
let allObjects = {};
let orbits = {};
let asteroids = [];
let time = 0;
let cameraController;

function init() {
   // Create scene
   scene = new THREE.Scene();
   
   // Set up camera
   camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
   camera.position.set(200, 100, 200);
   camera.lookAt(0, 0, 0);
   
   // Initialize camera controller
   cameraController = new CameraController(camera);
   
   // Set up renderer
   renderer = new THREE.WebGLRenderer({ antialias: true });
   renderer.setSize(window.innerWidth, window.innerHeight);
   document.body.appendChild(renderer.domElement);

   // Add lighting
   const ambientLight = new THREE.AmbientLight(0x333333);
   scene.add(ambientLight);
   const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
   scene.add(sunLight);

   createSun();
   createCelestialBodies();
   createAsteroidBelt();
   setupControls();
}

function createSun() {
   const geometry = new THREE.SphereGeometry(sunData.radius, 32, 32);
   const material = new THREE.MeshBasicMaterial({
       color: sunData.color
   });
   const sun = new THREE.Mesh(geometry, material);
   sun.userData = { name: "Sun", info: sunData.info };
   scene.add(sun);
   allObjects["Sun"] = sun;
}

function createCelestialBodies() {
   Object.entries(celestialData).forEach(([name, data]) => {
       const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
       let material;

       if (['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(name)) {
           material = new THREE.MeshPhongMaterial({
               map: createGasGiantTexture(`#${data.color.toString(16).padStart(6, '0')}`),
               color: data.color
           });
       } else {
           material = new THREE.MeshPhongMaterial({
               map: createPlanetTexture(4, 0.7, `#${data.color.toString(16).padStart(6, '0')}`),
               color: data.color
           });
       }

       const planet = new THREE.Mesh(geometry, material);
       planet.userData = { name, info: data.info };

       // Create orbit
       const orbitGeometry = new THREE.BufferGeometry();
       const orbitPoints = [];
       const segments = 128;
       
       for (let i = 0; i <= segments; i++) {
           const theta = (i / segments) * Math.PI * 2;
           orbitPoints.push(
               Math.cos(theta) * data.distance,
               0,
               Math.sin(theta) * data.distance
           );
       }
       
       orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
       const orbit = new THREE.Line(
           orbitGeometry,
           new THREE.LineBasicMaterial({ color: data.orbitColor })
       );
       
       scene.add(orbit);
       scene.add(planet);
       
       allObjects[name] = planet;
       orbits[name] = orbit;

       // Add Saturn's rings
       if (name === 'Saturn') {
           const ringGeometry = new THREE.RingGeometry(5, 8, 64);
           const ringMaterial = new THREE.MeshPhongMaterial({
               color: 0xb7b7b7,
               side: THREE.DoubleSide,
               transparent: true,
               opacity: 0.6
           });
           const rings = new THREE.Mesh(ringGeometry, ringMaterial);
           rings.rotation.x = Math.PI / 2;
           planet.add(rings);
       }
   });
}

function createAsteroidBelt() {
   const asteroidCount = 2000;
   const minRadius = 35;
   const maxRadius = 45;

   for (let i = 0; i < asteroidCount; i++) {
       const radius = Math.random() * (maxRadius - minRadius) + minRadius;
       const theta = Math.random() * Math.PI * 2;
       const y = (Math.random() - 0.5) * 2;

       const asteroidGeometry = new THREE.SphereGeometry(0.1, 4, 4);
       const shade = Math.random() * 0.5 + 0.5;
       const asteroidMaterial = new THREE.MeshPhongMaterial({
           color: new THREE.Color(shade, shade, shade)
       });

       const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
       asteroid.position.set(
           Math.cos(theta) * radius,
           y,
           Math.sin(theta) * radius
       );

       asteroid.userData = {
           radius,
           orbitSpeed: (1 / radius) * 0.5,
           orbitAngle: theta
       };

       scene.add(asteroid);
       asteroids.push(asteroid);
   }
}

function setupControls() {
   const timeSpeedSlider = document.getElementById('timeSpeed');
   const objectSelect = document.getElementById('objectSelect');

   objectSelect.addEventListener('change', (e) => {
       const selectedObject = e.target.value;
       if (selectedObject && allObjects[selectedObject]) {
           const object = allObjects[selectedObject];
           cameraController.focusOnObject(object.position);
       }
   });

   // Add click detection
   const raycaster = new THREE.Raycaster();
   const mouse = new THREE.Vector2();
   const planetInfo = document.getElementById('planetInfo');

   document.addEventListener('click', (event) => {
       mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
       mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

       raycaster.setFromCamera(mouse, camera);
       
       const intersects = raycaster.intersectObjects(Object.values(allObjects));
       if (intersects.length > 0) {
           planetInfo.innerHTML = intersects[0].object.userData.info;
       }
   });

   // Handle window resizing
   window.addEventListener('resize', () => {
       camera.aspect = window.innerWidth / window.innerHeight;
       camera.updateProjectionMatrix();
       renderer.setSize(window.innerWidth, window.innerHeight);
   });
}

function animate() {
   requestAnimationFrame(animate);

   const timeSpeed = parseFloat(document.getElementById('timeSpeed').value);

   // Update camera controls
   cameraController.update();

   // Update planet positions
   Object.entries(celestialData).forEach(([name, data]) => {
       const planet = allObjects[name];
       if (planet) {
           const angle = (time / data.period) * Math.PI * 2;
           planet.position.x = Math.cos(angle) * data.distance;
           planet.position.z = Math.sin(angle) * data.distance;
           planet.rotation.y += 0.01;
       }
   });

   // Update asteroid positions
   asteroids.forEach(asteroid => {
       const speed = asteroid.userData.orbitSpeed * timeSpeed;
       asteroid.userData.orbitAngle += speed;
       
       asteroid.position.x = Math.cos(asteroid.userData.orbitAngle) * asteroid.userData.radius;
       asteroid.position.z = Math.sin(asteroid.userData.orbitAngle) * asteroid.userData.radius;
   });

   time += timeSpeed;
   renderer.render(scene, camera);
}

// Initialize and start animation
init();
animate();
