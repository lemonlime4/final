import * as THREE from 'three';
import { options } from './options.js';
import {
    fixedCameraZones,
    firstPersonBounds,
} from './scene.js';
import { player } from './player.js';



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
    constructor({ player, camera }) {
        this.player = player;
        this.camera = camera;
        this.keys = {
            up: false,
            left: false,
            down: false,
            right: false
        };
    }
    
    handleKeydown(event) {
        const dir = options.firstPersonKeyMapping.get(event.code);
        if (dir) this.keys[dir] = true;
    }
    
    handleKeydown(event) {
        const dir = options.firstPersonKeymapping.get(event.code);
        if (dir) this.keys[dir] = false;
    }
}



export class Game {
    constructor({ player, camera, mouse }) {
        this.player = player;
        this.camera = camera;
        this.mouse = mouse;

        this.controller = null;
        this.updateController();
    }

    update(dt) {
        this.player.update(dt);
        this.updateController();
        this.controller.update(dt);
    }

    updateController() {
        if (firstPersonBounds.containsPoint(this.player.model.position)) {
            this.controller = new FirstPersonController(this);
        }
    }

    handleMousedown(e) {
        this.controller.handleMousedown?.(e);
    }

    handleMousemove(e) {
        this.controller.handleMousemove?.(e);
    }

    handleKeydown(e) {
        this.controller.handleKeydown?.(e);
    }

    handleKeyup() {
        this.controller.handleKeyup?.(e);
    }
}