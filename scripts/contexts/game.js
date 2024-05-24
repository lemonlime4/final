import * as THREE from 'three';
import { Context } from './interface.js';
import { options } from '../options.js';
import { player } from '../player.js';
import {
    fixedCameraZones,
    firstPersonBounds,
} from '../scene.js';


class FirstPersonController {
    static keyMapping = new Map([
        ['KeyW', 'up'],
        ['ArrowUp', 'up'],
        ['KeyA', 'left'],
        ['ArrowLeft', 'left'],
        ['KeyS', 'down'],
        ['ArrowDown', 'down'],
        ['KeyD', 'right'],
        ['ArrowRight', 'right'],
    ]);
    constructor({ player, camera, mouse }) {
        this.player = player;
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














export class GameContext extends Context {
    constructor({ camera, mouse }) {
        super();
        this.camera = camera;
        this.mouse = mouse;

        this.controller = null;
        this.updateController();
    }

    update(dt) {
        player.update(dt);
        this.updateController();
        this.controller.update(dt);
    }

    updateController() {
        if (firstPersonBounds.containsPoint(player.model.position)) {
            this.controller = new FirstPersonController(this);
        }
    }

    handleMousemove(event) {
        this.controller.handleMousemove(event);
    }

    handleMousedown(event) {
        this.controller.handleMousedown(event);
    }

    handleKeydown(event) {
        this.controller.handleKeydown(event);
    }

    handleKeyup(event) {
        this.controller.handleKeyup(event);
    }
}