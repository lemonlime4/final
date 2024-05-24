import * as THREE from 'three';
import { options } from './options.js';
import {
    fixedCameraZones,
    firstPersonBounds,
} from './scene.js';



class FirstPersonController {
    constructor() {
        ;
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
            this.controller = new FirstPersonController({
                this.player, this.camera
            });
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