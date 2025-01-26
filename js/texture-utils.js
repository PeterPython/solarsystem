// texture-utils.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r159/three.module.js';

export function createPlanetTexture(detail, roughness, baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    // Fill with base color
    context.fillStyle = baseColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise pattern
    for (let i = 0; i < detail; i++) {
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                if (Math.random() > roughness) {
                    const shade = Math.random() * 0.1 - 0.05;
                    context.fillStyle = `rgba(0,0,0,${shade})`;
                    context.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export function createGasGiantTexture(baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    // Base color
    context.fillStyle = baseColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Create bands
    const bands = 12;
    for (let i = 0; i < bands; i++) {
        const y = (i * canvas.height) / bands;
        const height = canvas.height / bands;
        context.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        context.fillRect(0, y, canvas.width, height);
    }

    // Add swirls
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 20 + 10;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255,255,255,0.05)';
        context.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}
