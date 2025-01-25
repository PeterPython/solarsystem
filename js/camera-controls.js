// camera-controls.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
export class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.cameraAngle = { x: 0, y: 0 };
        this.cameraDistance = 200;
        
        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('wheel', this.handleWheel.bind(this));
    }

    handleMouseDown(e) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;

        const deltaMove = {
            x: e.clientX - this.previousMousePosition.x,
            y: e.clientY - this.previousMousePosition.y
        };

        this.cameraAngle.x += deltaMove.y * 0.01;
        this.cameraAngle.y += deltaMove.x * 0.01;

        this.cameraAngle.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.cameraAngle.x));
        this.updateCameraPosition();
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    handleWheel(e) {
        this.cameraDistance = Math.max(50, Math.min(1000, this.cameraDistance + e.deltaY * 0.5));
        this.updateCameraPosition();
    }

    updateCameraPosition() {
        const x = this.cameraDistance * Math.cos(this.cameraAngle.x) * Math.sin(this.cameraAngle.y);
        const y = this.cameraDistance * Math.sin(this.cameraAngle.x);
        const z = this.cameraDistance * Math.cos(this.cameraAngle.x) * Math.cos(this.cameraAngle.y);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }

    focusOnObject(position) {
        this.camera.position.set(
            position.x + 30,
            position.y + 30,
            position.z + 30
        );
        this.camera.lookAt(position);
    }

    reset() {
        this.camera.position.set(200, 100, 200);
        this.camera.lookAt(0, 0, 0);
    }
}
