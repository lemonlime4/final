import * as THREE from 'three';
import { player } from '../player.js';
import { options } from '../options.js';
import { interactions } from '../scene.js';

export class FixedCameraController {
    constructor({ camera, mouse, map, interaction }) {
        this.isFixedCamera = true;
        this.camera = camera;
        this.map = map;
        this.raycaster = new THREE.Raycaster();
        this.interaction = null;

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
        const sceneIntersects = this.raycaster.intersectObject(this.map);
        const interactionIntersects = interactions;
    }

    handleMousemove() {
        const screenspaceMouse = new THREE.Vector2(
            -1 + 2 * this.mouse.position.x / window.innerWidth,
            +1 - 2 * this.mouse.position.y / window.innerHeight
        );
        this.raycaster.setFromCamera(screenspaceMouse, this.camera);
    }
};