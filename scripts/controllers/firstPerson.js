import * as THREE from 'three';
import { player } from '../player.js';
import { options } from '../options.js';
import { map, enterInitialCameraEuler } from '../scene.js';
import { controlPanelBounds } from '../interactions/interactions.js';


export class FirstPersonController {
    constructor({ state, postShader, raycaster, camera }) {
        this.isFirstPerson = true;
        this.gameFinished = false;
        this.state = state;
        this.postShader = postShader;
        this.raycaster = raycaster;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.mouseMovement = new THREE.Vector2();
    }

    init() {
        this.cameraEuler = enterInitialCameraEuler.clone();
        this.keys = {
            up: false,
            left: false,
            down: false,
            right: false
        };
        document.body.querySelector('#renderOutput').requestPointerLock()
        document.body.classList.remove(...document.body.classList);
        player.model.visible = false;
        this.postShader.uniforms.controlIconState.value = 1;
        this.camera.fov = options.firstPersonFov;
        this.camera.updateProjectionMatrix();
        this.camera.position.copy(player.model.position);
        this.camera.quaternion.setFromEuler(this.cameraEuler);
        return this;
    }

    update(dt) {
        const horizontalEuler = new THREE.Euler(0, this.cameraEuler.y - Math.PI, 0);
        this.camera.position.add(new THREE.Vector3(
            this.keys.left - this.keys.right,
            0,
            this.keys.up - this.keys.down
        ).normalize()
            .multiplyScalar(dt * options.firstPersonSpeed)
            .applyEuler(horizontalEuler));
        this.camera.position.y = options.firstPersonHeight;
        player.model.quaternion.setFromEuler(horizontalEuler);
        player.model.position.copy(this.camera.position);
        player.model.position.y = 0;
    }

    handleMousemove(event) {
        // move camera
        this.mouseMovement.set(event.movementX, event.movementY);
        this.cameraEuler.y -= this.mouseMovement.x * options.firstPersonSensitivity;
        this.cameraEuler.x -= this.mouseMovement.y * options.firstPersonSensitivity;
        this
        this.cameraEuler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraEuler.x));
        this.camera.quaternion.setFromEuler(this.cameraEuler);
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        // show control panel use message
        this.hoveringAndReady = false;
        const point = this.raycaster.ray.intersectBox(controlPanelBounds, new THREE.Vector3());
        if (!point) return;
        const sceneIntersects = this.raycaster.intersectObject(map);
        if (sceneIntersects.length > 0 &&
            sceneIntersects[0].distance < point.distanceTo(this.raycaster.ray.origin)
        ) return;
        if (!this.state.hasKey) return;
        this.hoveringAndReady = true;
    }

    handleMousedown(event) {
        if (!this.hoveringAndReady) return;
        this.disabledMissile = true;
    }

    handleKeydown(event) {
        const dir = options.firstPersonKeyMapping.get(event.code);
        if (dir) this.keys[dir] = true;
    }

    handleKeyup(event) {
        const dir = options.firstPersonKeyMapping.get(event.code);
        if (dir) this.keys[dir] = false;
    }
}