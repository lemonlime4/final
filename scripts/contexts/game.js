import * as THREE from 'three';
import { Context } from './interface.js';
import { options } from '../options.js';
import { player } from '../player.js';
import {
    fixedCameraZones,
    firstPersonBounds,
} from '../scene.js';


import { FirstPersonController } from '../controllers/firstPerson.js';
import { FixedCameraController } from '../controllers/fixedCamera.js';















export class GameContext extends Context {
    constructor({ camera, mouse, overlay }) {
        super();
        this.camera = camera;
        this.mouse = mouse;
        this.overlay = overlay;
        this.transitionToMenuContext = false;


        this.controller = new FirstPersonController(this);
        this.interaction = null;
        overlay.ctx.clearRect(0, 0, overlay.canvas.width, overlay.canvas.height);
    }

    update(dt) {
        player.update(dt);
        this.updateController();
        this.controller.update(dt);
    }

    updateController() {
        if (firstPersonBounds.containsPoint(player.model.position)) {
            if (!this.controller?.isFirstPerson) {
                this.controller = new FirstPersonController(this);
            }
        }
        const zone = fixedCameraZones.find(zone => zone.bounds.containsPoint(player.model.position));
        if (!zone) return;
        if (!this.controller.isFixedCamera)
            this.controller = new FixedCameraController(this);
        this.controller.setZone(zone);
    }

    handleMousemove(event) {
        this.controller.handleMousemove?.(event);
    }

    handleMousedown(event) {
        this.controller.handleMousedown?.(event);
    }

    handleKeydown(event) {
        this.controller.handleKeydown?.(event);
    }

    handleKeyup(event) {
        this.controller.handleKeyup?.(event);
    }
}