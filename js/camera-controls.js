// camera-controls.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/110/three.module.js';

export class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.target = new THREE.Vector3(0, 0, 0);
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        this.scale = 1;
        this.zoomSpeed = 0.1;
        this.rotateSpeed = 0.5;
        this.dampingFactor = 0.05;
        
        // Initialize spherical coordinates
        this.updateSphericalFromCamera();
        this.initEventListeners();
    }

    updateSphericalFromCamera() {
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target);
        this.spherical.setFromVector3(offset);
    }

    initEventListeners() {
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('wheel', this.onMouseWheel.bind(this));
    }

    onMouseDown(event) {
        if (event.button === 0) { // Left mouse button
            this.isDragging = true;
            this.previousMousePosition.x = event.clientX;
            this.previousMousePosition.y = event.clientY;
        }
    }

    onMouseMove(event) {
        if (!this.isDragging) return;

        const deltaX = event.clientX - this.previousMousePosition.x;
        const deltaY = event.clientY - this.previousMousePosition.y;

        this.sphericalDelta.theta -= (deltaX * this.rotateSpeed) / 100;
        this.sphericalDelta.phi -= (deltaY * this.rotateSpeed) / 100;

        this.previousMousePosition.x = event.clientX;
        this.previousMousePosition.y = event.clientY;

        this.update();
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onMouseWheel(event) {
        event.preventDefault();

        if (event.deltaY > 0) {
            this.scale *= (1 + this.zoomSpeed);
        } else {
            this.scale /= (1 + this.zoomSpeed);
        }

        this.scale = Math.max(1, Math.min(this.scale, 100));
        this.update();
    }

    update() {
        // Apply rotation changes
        this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
        this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;

        // Restrict phi to avoid going past the poles
        this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));

        // Apply zoom
        this.spherical.radius = 200 * this.scale;

        // Convert spherical coordinates back to cartesian
        const offset = new THREE.Vector3();
        offset.setFromSpherical(this.spherical);

        // Update camera position and orientation
        this.camera.position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);

        // Reset deltas
        this.sphericalDelta.theta *= (1 - this.dampingFactor);
        this.sphericalDelta.phi *= (1 - this.dampingFactor);
    }

    focusOnObject(position) {
        this.target.copy(position);
        this.spherical.radius = 30;
        this.update();
    }

    reset() {
        this.target.set(0, 0, 0);
        this.scale = 1;
        this.spherical.set(200, Math.PI/3, 0);
        this.sphericalDelta.set(0, 0, 0);
        this.update();
    }
}
