// A bunch of hardcoded data about the scene.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



export const map = await new Promise(resolve => new GLTFLoader().load(
    '../assets/models/scene.glb',
    gltf => {
        for (const obj of gltf.scene.children) {
            obj.material.side = THREE.FrontSide;
        }
        console.log(gltf.scene);
        resolve(gltf.scene);
    }
));







function makeFixedCameraZone(name, ax, az, bx, bz, fx, fy, fz, tx, ty, tz) {
    return {
        name,
        bounds: new THREE.Box3(
            new THREE.Vector3(ax, -.5, az),
            new THREE.Vector3(bx, .5, bz)
        ),
        camera: {
            from: new THREE.Vector3(fx, fy, fz),
            to: new THREE.Vector3(tx, ty, tz)
        }
    }
}

export const fixedCameraZones = [
    makeFixedCameraZone(
        "Top",
        3.1, 0.4, 11.5, 5.9,
        0, 1.5, 3, 5, 1, 3
    ),
    makeFixedCameraZone(
        "Boiler",
        10.4, 6, 18.7, 14.2,
        7.2, 1.5, 10, 11, 1, 10
    ),
    makeFixedCameraZone(
        "Bottom",
        -.9, 14.2, 11.5, 20.2,
        14, 1.5, 15.5, 10, 1, 16
    ),
    makeFixedCameraZone(
        "Storage",
        0.2, 6.5, 7.2, 13.7,
        10, 2.2, 8.5, 5, 1, 9.5
    ),
];


export const firstPersonBounds = new THREE.Box3(
    new THREE.Vector3(-1.8, -.5, -1.3),
    new THREE.Vector3(1.8, .5, 1.4)
);


export const enterInitialCameraEuler = new THREE.Euler(-0.2, 1, 0, "YXZ");


function makePointLight(x, y, z, intensity, radius, color = 0xffffff) {
    const light = new THREE.PointLight(color, intensity, radius);
    light.position.set(x, y, z);
    return light;
}

export const lights = [
    new THREE.AmbientLight(0x404040),

    // initial
    makePointLight(
        0, 3, 0,
        3, 5,
    ),
    makePointLight(
        0, 1.5, 0,
        0.2, 10
    ),

    // top
    makePointLight(
        5.5, 4, 3,
        12, 6
    ),
    makePointLight(
        8.5, 4, 3,
        12, 6
    ),
    makePointLight(
        7, -2, 3,
        3, 6
    ),

    // boiler
    makePointLight(
        10.9, 4, 7,
        4, 5
    ),
    makePointLight(
        10.9, 1.5, 7,
        0.1, 2
    ),
    makePointLight(
        10.9, 4, 13.5,
        4, 5
    ),
    makePointLight(
        10.9, 1.5, 13.5,
        0.1, 2
    ),
    makePointLight(
        16, 3, 10,
        2, 6
    ),
    makePointLight(
        14, 3, 10,
        2, 6
    ),
    makePointLight(
        13, 3, 10,
        3, 3
    ),
    makePointLight(
        13, 2, 10,
        0.1, 5
    ),

    // bottom
    makePointLight(
        2, 4, 17.2,
        9, 7
    ),
    makePointLight(
        5.2, 4, 17.2,
        6, 6
    ),
    makePointLight(
        8, 4, 17.2,
        5, 6
    ),
    makePointLight(
        3, -2, 17.2,
        2, 6,
    ),
    makePointLight(
        6, -2, 17.2,
        2, 6,
    ),


    // storage
    makePointLight(
        3.6, 4, 10.1,
        15, 8
    ),
    makePointLight(
        3.6, 2, 10.1,
        1, 5
    ),
    makePointLight(
        -0.5, 3, 8.7,
        2, 5
    ),
];