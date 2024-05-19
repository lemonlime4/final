import * as THREE from 'three';

export class CameraPosition {
    constructor(x0, y0, z0, x1, y1, z1) {
        this.from = new THREE.Vector3(x0, y0, z0);
        this.to = new THREE.Vector3(x1, y1, z1);
    }
    setCamera(camera) {
        camera.position = this.from;
        camera.lookAt(this.to);
    }
}
export const sceneInfo = {
    initialCameraPosition: new CameraPosition(
        20, 10, 5,
        0, 0, 0
    ),

    zones: [
        {
            bounds: new THREE.Box3(
                new THREE.Vector3(-.5, 0, -.5),
                new THREE.Vector3(.5, .5, .5)
            ),
            camera: new CameraPosition(
                0, 15, 0,
                0, 0, 0
            )
        },
        {
            bounds: new THREE.Box3(
                new THREE.Vector3(-5, -1, -3),
                new THREE.Vector3(-1, 1, 1)
            ),
            camera: new CameraPosition(
                3, 5, 8,
                0, 0, -0
            )
        },
        {
            bounds: new THREE.Box3(
                new THREE.Vector3(3, -1, -1),
                new THREE.Vector3(8, 1, 1),
            ),
            camera: new CameraPosition(
                -8, 15, 1,
                0, 0, 0
            )
        },
        {
            isFirstPerson: true,
            bounds: new THREE.Box3(
                new THREE.Vector3(2, -1, 2),
                new THREE.Vector3(6, 1, 5)
            ),
            camera: {
                euler: new THREE.Euler(),
            }
        }
    ]
}