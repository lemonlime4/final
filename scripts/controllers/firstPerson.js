import * as THREE from 'three';
import { player } from '../player.js';
import { Controller } from './interface.js';

export class FirstPersonController extends Controller {
    constructor({ camera, mouse }) {
        this.camera = camera;
        this.cameraEuler = new THREE.Euler(0, 0, 0, "YXZ");
        this.keys = {
            up: false,
            left: false,
            down: false,
            right: false
        };
        this.mouseMovement = new THREE.Vector2();
    }

    update(dt) {
        player.model.quaternion.setFromEuler(new THREE.Euler(0, this.cameraEuler.y - Math.PI, 0));
        player.model.position.add(new THREE.Vector3(
                this.keys.left - this.keys.right,
                0,
                this.keys.up - this.keys.down
            ).normalize().multiplyScalar(dt * options.walkSpeed)
            .applyQuaternion(player.model.quaternion));
        this.cameraEuler.y -= mouse.movement.x * options.firstPersonSensitivity;
        this.cameraEuler.x -= mouse.movement.y * options.firstPersonSensitivity;
        this.cameraEuler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraEuler.x));
        camera.position.copy(player.model.position)
            .add(new THREE.Vector3(0, options.firstPersonHeight, 0));
        camera.quaternion.setFromEuler(this.cameraEuler);
        this.mouseMovement.set(0, 0);
    }

    handleMousemove(event) {
        this.mouseMovement.set(event.movementX, event.movementY);
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