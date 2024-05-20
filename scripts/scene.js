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
        7.5, 1.5, 10, 11, 1, 10
    ),
    makeFixedCameraZone(
        "Bottom",
        -.9, 14.2, 11.5, 20.2,
        14, 1.5, 15.5, 10, 1, 16
    ),
    makeFixedCameraZone(
        "Storage",
        0.2, 6.5, 7.2, 13.7,
        -3, 1.5, 10, 5, 1, 11
    ),
    makeFixedCameraZone(
        "Initial",
        - .5, -.5, .5, .5,
        0, 15, 0, 0, 0, 0
    ),
];