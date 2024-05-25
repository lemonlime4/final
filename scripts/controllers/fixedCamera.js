import * as THREE from 'three';
import { player } from '../player.js';
import { options } from '../options.js';

export class FixedCameraController {
    constructor({ camera, mouse }) {
        this.isFixedCamera = true;
        this.camera = camera;

        player.model.visible = true;
        player.stopWalking();
        camera.fov = options.fov;
        camera.updateProjectionMatrix();
    }

    update(dt) {
        player.update(dt);
    }

    setCamera(cameraOrientation) {
        this.camera.position.copy(cameraOrientation.from);
        this.camera.lookAt(cameraOrientation.to);
    }

    handleClick() {
        this.mouse.position
    }
};