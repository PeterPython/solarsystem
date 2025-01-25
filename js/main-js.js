// main.js
import * as THREE from 'three';
import { CameraController } from './camera-controls.js';
import { createPlanetTexture, createGasGiantTexture } from './texture-utils.js';
import { celestialData, sunData } from './celestial-data.js';

class SolarSystem {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.allObjects = {};
        this.orbits = {};
        this.time = 0;
        this.asteroids = [];
        
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Setup camera and controls
        this.camera.position.set(200, 100, 200);
        this.camera.lookAt(0, 0, 0);
        this.cameraController = new CameraController(this.camera);

        // Setup lighting
        this.setupLighting();

        // Create celestial bodies
        this.createSun();
        this.createCelestialBodies();
        this.createAsteroidBelt();

        // Setup UI controls
        this.setupUIControls();

        // Setup event listeners
        this.setupEventListeners();

        // Start animation
        this.animate();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x333333);
        const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
        this.scene.add(ambientLight, sunLight);
    }

    createSun() {
        const geometry = new THREE.SphereGeometry(sunData.radius, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: sunData.color,
            emissive: sunData.color,
            emissiveIntensity: 1
        });
        const sun = new THREE.Mesh(geometry, material);
        sun.userData = { name: "Sun", info: sunData.info };
        this.scene.add(sun);
        this.allObjects["Sun"] = sun;
    }

    createCelestialBody(name, data, parentObject = null) {
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        let material;

        if (name === 'Jupiter' || name === 'Saturn' || name === 'Uranus' || name === 'Neptune') {
            material = new THREE.MeshPhongMaterial({
                map: createGasGiantTexture(`#${data.color.toString(16).padStart(6, '0')}`),
                emissive: data.color,
                emissiveIntensity: 0.2,
                bumpScale: 0.05,
                shininess: 15
            });
        } else {
            material = new THREE.MeshPhongMaterial({
                map: createPlanetTexture(4, 0.7, `#${data.color.toString(16).padStart(6, '0')}`),
                emissive: data.color,
                emissiveIntensity: 0.2,
                bumpScale: 0.05,
                shininess: 20
            });
        }

        const body = new THREE.Mesh(geometry, material);
        body.userData = { name: name, info: data.info };

        if (name === 'Saturn') {
            this.addSaturnRings(body);
        }

        this.createOrbit(name, data, body, parentObject);
        this.allObjects[name] = body;

        // Create moons if they exist
        if (data.moons) {
            Object.entries(data.moons).forEach(([moonName, moonData]) => {
                this.createCelestialBody(moonName, moonData, body);
            });
        }

        return body;
    }

    addSaturnRings(saturn) {
        const ringGeometry = new THREE.RingGeometry(5, 8, 64);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xb7b7b7,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6,
            map: createPlanetTexture(2, 0.9, '#b7b7b7')
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        saturn.add(rings);
    }

    createOrbit(name, data, body, parentObject) {
        const orbitGeometry = new THREE.BufferGeometry();
        const segments = 128;
        const orbitPoints = [];

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            orbitPoints.push(
                Math.cos(theta) * data.distance,
                0,
                Math.sin(theta) * data.distance
            );
        }

        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
        const orbitMaterial = new THREE.LineBasicMaterial({ color: data.orbitColor });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);

        if (parentObject) {
            const moonOrbit = new THREE.Object3D();
            parentObject.add(moonOrbit);
            moonOrbit.add(body);
            parentObject.add(orbit);
        } else {
            this.scene.add(orbit);
            this.scene.add(body);
        }

        this.orbits[name] = orbit;
    }

    createAsteroidBelt() {
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
                color: new THREE.Color(shade, shade, shade),
                emissive: new THREE.Color(shade/8, shade/8, shade/8)
            });

            const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
            asteroid.position.set(
                Math.cos(theta) * radius,
                y,
                Math.sin(theta) * radius
            );

            asteroid.userData = {
                radius: radius,
                orbitSpeed: (1 / radius) * 0.5,
                orbitAngle: theta
            };

            this.scene.add(asteroid);
            this.asteroids.push(asteroid);
        }
    }

    setupUIControls() {
        const timeSpeedSlider = document.getElementById('timeSpeed');
        const timeSpeedValue = document.getElementById('timeSpeedValue');
        const objectSelect = document.getElementById('objectSelect');

        timeSpeedSlider.addEventListener('input', (e) => {
            timeSpeedValue.textContent = e.target.value;
        });

        this.populateObjectSelect(objectSelect);
        objectSelect.addEventListener('change', (e) => {
            this.handleObjectSelection(e.target.value);
        });
    }

    populateObjectSelect(select) {
        const optgroups = {
            'Sun': document.createElement('optgroup'),
            'Inner Planets & Moons': document.createElement('optgroup'),
            'Outer Planets & Major Moons': document.createElement('optgroup'),
            'Dwarf Planets': document.createElement('optgroup')
        };

        optgroups['Sun'].label = 'Sun';
        optgroups['Inner Planets & Moons'].label = 'Inner Planets & Moons';
        optgroups['Outer Planets & Major Moons'].label = 'Outer Planets & Major Moons';
        optgroups['Dwarf Planets'].label = 'Dwarf Planets';

        // Add all celestial bodies to their respective groups
        Object.keys(this.allObjects).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            
            if (name === 'Sun') {
                optgroups['Sun'].appendChild(option);
            } else if (['Mercury', 'Venus', 'Earth', 'Mars'].includes(name.split('-')[0])) {
                optgroups['Inner Planets & Moons'].appendChild(option);
            } else if (['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(name.split('-')[0])) {
                optgroups['Outer Planets & Major Moons'].appendChild(option);
            } else if (['Pluto', 'Ceres', 'Eris'].includes(name)) {
                optgroups['Dwarf Planets'].appendChild(option);
            }
        });

        Object.values(optgroups).forEach(group => {
            if (group.children.length > 0) {
                select.appendChild(group);
            }
        });
    }

    handleObjectSelection(selectedObject) {
        if (selectedObject === "Sun") {
            this.cameraController.reset();
        } else if (selectedObject && selectedObject in this.allObjects) {
            const object = this.allObjects[selectedObject];
            const position = new THREE.Vector3();
            object.getWorldPosition(position);
            this.cameraController.focusOnObject(position);
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.setupClickDetection();
    }

    setupClickDetection() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const planetInfo = document.getElementById('planetInfo');

        document.addEventListener('click', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            
            const allObjectsToCheck = Object.values(this.allObjects);
            const objectIntersects = raycaster.intersectObjects(allObjectsToCheck);
            const orbitIntersects = raycaster.intersectObjects(Object.values(this.orbits));

            if (objectIntersects.length > 0) {
                planetInfo.innerHTML = objectIntersects[0].object.userData.info;
            } else if (orbitIntersects.length > 0) {
                const orbit = orbitIntersects[0].object;
                const bodyName = Object.keys(this.orbits).find(key => this.orbits[key] === orbit);
                if (bodyName && celestialData[bodyName]) {
                    planetInfo.innerHTML = celestialData[bodyName].info;
                }
            }
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const timeSpeed = parseFloat(document.getElementById('timeSpeed').value);
        this.updatePositions(timeSpeed);
        this.renderer.render(this.scene, this.camera);
    }

    updatePositions(timeSpeed) {
        Object.entries(celestialData).forEach(([name, data]) => {
            if (name in this.allObjects) {
                const object = this.allObjects[name];
                const angle = (this.time / data.period) * Math.PI * 2;
                
                if (!object.parent || object.parent.type !== "Object3D") {
                    object.position.x = Math.cos(angle) * data.distance;
                    object.position.z = Math.sin(angle) * data.distance;
                }
                
                object.rotation.y += 0.01;

                if (data.moons) {
                    this.updateMoonPositions(data.moons, object);
                }
            }
        });

        this.updateAsteroidPositions(timeSpeed);
        this.time += timeSpeed;
    }

    updateMoonPositions(moons, parentObject) {
        Object.entries(moons).forEach(([moonName, moonData]) => {
            const moonAngle = (this.time / moonData.period) * Math.PI * 2;
            const moonObject = this.allObjects[moonName];
            if (moonObject && moonObject.parent) {
                moonObject.position.x = Math.cos(moonAngle) * moonData.distance;
                moonObject.position.z = Math.sin(moonAngle) * moonData.distance;
            }
        });
    }

    updateAsteroidPositions(timeSpeed) {
        this.asteroids.forEach(asteroid => {
            const speed = asteroid.userData.orbitSpeed * timeSpeed;
            asteroid.userData.orbitAngle += speed;
            
            asteroid.position.x = Math.cos(asteroid.userData.orbitAngle) * asteroid.userData.radius;
            asteroid.position.z = Math.sin(asteroid.userData.orbitAngle) * asteroid.userData.radius;
            asteroid.position.y += Math.sin(this.time * 0.001) * 0.001;
        });
    }
}

// Initialize the solar system
new SolarSystem();