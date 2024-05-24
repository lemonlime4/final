import * as THREE from 'three';
import { Context } from './interface.js';
import { options } from '../options.js';
import { player } from '../player.js';
import {
    fixedCameraZones,
    firstPersonBounds,
} from '../scene.js';


import { FirstPersonController } from '../controllers/firstPerson.js';















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