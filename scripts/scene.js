import * as THREE from 'three';

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
        0, 2, 3, 5, 1, 3
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
        -3, 2, 9.5, 5, 1, 10.5
    ),
];


export const firstPersonBounds = new THREE.Box3(
    new THREE.Vector3(-1.8, -.5, -1.3),
    new THREE.Vector3(3.1, .5, 1.4)
);



export const walkAreas = [
    { // to initial
        box: new THREE.Box3(
            new THREE.Vector3(2.3, -.1, .3),
            new THREE.Vector3(4.5, 2.5, 1)
        ),
        target: new Map([
            ["Top", new THREE.Vector3(2, 0, 1)]
        ]),
    },
    { // to storage
        box: new THREE.Box3(
            new THREE.Vector3(4.3, -.1, 5.5),
            new THREE.Vector3(6.3, 2.5, 6)
        ),
        target: new Map([
            ["Top", new THREE.Vector3(5.3, 0, 7.3)]
        ]),
    },
    {
        box: new THREE.Box3(
            new THREE.Vector3(10, -.1, 5.5),
            new THREE.Vector3(12, 2.5, 8)
        ),
        target: new Map([
            ["Top", new THREE.Vector3(11, 0, 7.8)],
            ["Boiler", new THREE.Vector3(11, 0, 5.6)]
        ]),
    },
    {
        box: new THREE.Box3(
            new THREE.Vector3(10.1, -.1, 12.1),
            new THREE.Vector3(12, 2.5, 14.6)
        ),
        target: new Map([
            ["Boiler", new THREE.Vector3(11, 0, 14.5)],
            ["Bottom", new THREE.Vector3(11, 0, 12.4)],
        ]),
    },
    {
        box: new THREE.Box3(
            new THREE.Vector3(.6, -.1, 13.2),
            new THREE.Vector3(2.5, 2.5, 14.8)
        ),
        target: new Map([
            ["Bottom", new THREE.Vector3(1.7, 0, 13.3)],
            ["Storage", new THREE.Vector3(1.7, 0, 14.5)],
        ]),
    },
];