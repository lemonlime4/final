import * as THREE from 'three';

function makeFixedCameraZone(ax, az, bx, bz, fx, fy, fz, tx, ty, tz) {
    return {
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
        -.5, -.5, .5, .5,
        0, 15, 0, 0, 0, 0
    ),
    makeFixedCameraZone(
        3, 0, 12, 6,
        0, 2, 3, 5, 1, 3
    )
];