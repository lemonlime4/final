import * as THREE from 'three';
import { player } from '../player.js';
import { options } from '../options.js';



export class FirstPersonController {
    constructor({ camera, mouse }) {
        this.isFirstPerson = true;
        this.camera = camera;
        this.cameraEuler = new THREE.Euler(0, 0, 0, "YXZ");
        this.keys = {
            up: false,
            left: false,
            down: false,
            right: false
        };
        this.mouseMovement = new THREE.Vector2();

        player.model.visible = false;
        camera.fov = options.firstPersonFov;
        camera.updateProjectionMatrix();
        camera.position.copy(player.model.position);
    }

    update(dt) {
        const horizontalEuler = new THREE.Euler(0, this.cameraEuler.y - Math.PI, 0);
        this.camera.position.add(new THREE.Vector3(
            this.keys.left - this.keys.right,
            0,
            this.keys.up - this.keys.down
        ).normalize()
            .multiplyScalar(dt * options.walkSpeed)
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
        this.cameraEuler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraEuler.x));
        this.camera.quaternion.setFromEuler(this.cameraEuler);
    }

    handleMousedown(event) {
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