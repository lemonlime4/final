import * as THREE from 'three';
import { player } from '../player.js';
import { options } from '../options.js';
import { enterInitialCameraEuler } from '../scene.js';


export class FirstPersonController {
    constructor({ postShader, camera, mouse }) {
        this.isFirstPerson = true;
        this.gameFinished = false;
        this.camera = camera;
        this.cameraEuler = enterInitialCameraEuler.clone();
        this.keys = {
            up: false,
            left: false,
            down: false,
            right: false
        };
        this.mouseMovement = new THREE.Vector2();

        document.body.querySelector('#renderOutput').requestPointerLock()
        document.body.classList.remove(...document.body.classList);
        postShader.uniforms.controlIconState.value = 1;
        player.model.visible = false;
        camera.fov = options.firstPersonFov;
        camera.updateProjectionMatrix();
        camera.position.copy(player.model.position);
        camera.quaternion.setFromEuler(this.cameraEuler);
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
        this.mouseMovement.set(event.movementX, event.movementY);
        this.cameraEuler.y -= this.mouseMovement.x * options.firstPersonSensitivity;
        this.cameraEuler.x -= this.mouseMovement.y * options.firstPersonSensitivity;
        this
        this.cameraEuler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraEuler.x));
        this.camera.quaternion.setFromEuler(this.cameraEuler);
    }

    handleMousedown(event) {
        this.gameFinished = true;
        console.log('mousedown in firstperson!!!');
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