import * as THREE from 'three';
import { Context } from './interface.js';
import { options } from '../options.js';
import { dialogTime } from '../dialog.js';
import { player } from '../player.js';
import {
    fixedCameraZones,
    firstPersonBounds,
} from '../scene.js';
import { initialToTopPosition } from '../interactions/interactions.js';

import { FirstPersonController } from '../controllers/firstPerson.js';
import { FixedCameraController } from '../controllers/fixedCamera.js';










export class GameContext extends Context {
    constructor({ postShader, camera, mouse, overlay }) {
        super();
        this.postShader = postShader;
        this.camera = camera;
        this.mouse = mouse;
        this.overlay = overlay;
        this.transitionToMenuContext = false;


        overlay.ctx.clearRect(0, 0, overlay.canvas.width, overlay.canvas.height);
        const cameraQuaternion = camera.quaternion.clone();
        this.controller = new FirstPersonController(this);
        this.controller.cameraEuler.setFromQuaternion(cameraQuaternion);
        camera.quaternion.copy(cameraQuaternion);
        dialogTime('Due to a technical issue, the missile will be launched in 10 minutes.', 5);
    }

    update(dt) {
        player.update(dt);
        this.updateController();
        this.controller.update(dt);
        if (this.controller.gameFinished) {
            this.transitionToMenuContext = true;
        }
    }

    updateController() {
        if (firstPersonBounds.containsPoint(player.model.position)) {
            if (!this.controller.isFirstPerson) {
                this.controller = new FirstPersonController(this);
            }
        }
        else if (this.controller.isFirstPerson) {
            // this.controller = new FixedCameraController(this);
            // this.controller.setZone(fixedCameraZones.find(zone => zone.name === 'Top'));
            // player.moveTo(initialToTopPosition);
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