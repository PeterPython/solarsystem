// celestial-data.js
import * as THREE from './three.module.js';

export const sunData = {
    radius: 8,
    color: 0xffff00,
    info: "Sun - Our Star<br>• Distance: 0 AU<br>• Diameter: 1,392,700 km<br>• Surface Temperature: 5,500°C<br>• Age: ~4.6 billion years<br>• Mass: 333,000 Earth masses<br>• Composition: 73% Hydrogen, 25% Helium"
};

export const celestialData = {
    Mercury: {
        radius: 0.8,
        distance: 10,
        period: 88,
        color: 0x8c8c8c,
        orbitColor: 0x4169e1,
        info: "Mercury - Innermost Planet<br>• Distance: 0.387 AU<br>• Diameter: 4,879 km<br>• Fun fact: Despite being closest to Sun, not the hottest"
    },
    Venus: {
        radius: 1.5,
        distance: 15,
        period: 225,
        color: 0xffd700,
        orbitColor: 0x4169e1,
        info: "Venus - The Hot Planet<br>• Distance: 0.723 AU<br>• Diameter: 12,104 km<br>• Fun fact: Rotates backwards"
    },
    Earth: {
        radius: 1.6,
        distance: 20,
        period: 365,
        color: 0x4169e1,
        orbitColor: 0x4169e1,
        info: "Earth - Our Home<br>• Distance: 1.0 AU<br>• Diameter: 12,742 km<br>• Fun fact: Only known planet with life"
    },
    Mars: {
        radius: 1.2,
        distance: 30,
        period: 687,
        color: 0xff4500,
        orbitColor: 0x4169e1,
        info: "Mars - The Red Planet<br>• Distance: 1.524 AU<br>• Diameter: 6,779 km<br>• Fun fact: Has the largest known volcano"
    },
    Jupiter: {
        radius: 4.0,
        distance: 50,
        period: 4333,
        color: 0xffa500,
        orbitColor: 0xffd700,
        info: "Jupiter - The Giant<br>• Distance: 5.203 AU<br>• Diameter: 139,820 km<br>• Fun fact: Has a permanent storm larger than Earth"
    },
    Saturn: {
        radius: 3.5,
        distance: 70,
        period: 10759,
        color: 0xffd700,
        orbitColor: 0xffd700,
        info: "Saturn - The Ringed Planet<br>• Distance: 9.537 AU<br>• Diameter: 116,460 km<br>• Fun fact: Could float in a giant bathtub"
    },
    Uranus: {
        radius: 3.0,
        distance: 90,
        period: 30687,
        color: 0x40e0d0,
        orbitColor: 0xffd700,
        info: "Uranus - The Sideways Planet<br>• Distance: 19.191 AU<br>• Diameter: 50,724 km<br>• Fun fact: Rotates on its side"
    },
    Neptune: {
        radius: 3.0,
        distance: 110,
        period: 60190,
        color: 0x0000ff,
        orbitColor: 0xffd700,
        info: "Neptune - The Windy Planet<br>• Distance: 30.069 AU<br>• Diameter: 49,244 km<br>• Fun fact: Fastest winds in the solar system"
    },
    Pluto: {
        radius: 0.4,
        distance: 130,
        period: 90560,
        color: 0xd3d3d3,
        orbitColor: 0xffffff,
        info: "Pluto - Dwarf Planet<br>• Distance: 39.482 AU<br>• Diameter: 2,377 km<br>• Fun fact: Was classified as a planet until 2006"
    }
};
