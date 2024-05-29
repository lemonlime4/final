import * as THREE from 'three';
import { Context } from './interface.js';
import { options } from '../options.js';
import { player } from '../player.js';
import { dialogTime } from '../dialog.js';
import {
    fixedCameraZones,
    firstPersonBounds,
} from '../scene.js';
import { initialToTopPosition } from '../interactions/interactions.js';

import { FirstPersonController } from '../controllers/firstPerson.js';
import { FixedCameraController } from '../controllers/fixedCamera.js';
import { audio } from '../audio.js';










export class GameContext extends Context {
    constructor({ postShader, camera, mouse, overlay }) {
        super();
        this.time = options.allottedTime;
        this.transitionToMenuContext = false;
        this.postShader = postShader;
        this.camera = camera;
        this.mouse = mouse;
        this.overlay = overlay;


        this.state = {
            hasKey: false,
            devicesPowered: false,
            update() {
                postShader.uniforms.hasKey.value = this.hasKey;
            }
        };
        this.state.update();

        this.unlockSafeCode = [0, 0, 0, 0]
            .map(() => Math.floor(9 * Math.random()));


        const cameraQuaternion = camera.quaternion.clone();
        this.firstPersonController = new FirstPersonController(this);
        this.fixedCameraController = new FixedCameraController(this);
        this.controller = this.firstPersonController.init();

        audio.background.pause();
        audio.music.currentTime = 0;
        audio.music.play();
        overlay.ctx.clearRect(0, 0, overlay.canvas.width, overlay.canvas.height);
        this.controller.cameraEuler.setFromQuaternion(cameraQuaternion);
        camera.quaternion.copy(cameraQuaternion);
        dialogTime(`Due to a technical issue, the missiles will be mistakenly launched in ${options.allottedTime / 60} minutes.`, 5);

        this.endingScreen = false;
    }

    update(dt) {
        const win = this.controller.disabledMissile;
        const lose = this.time < 0;
        if (win || lose) {
            this.state.hasKey = false;
            this.state.update();
            this.postShader.uniforms.controlIconState = 0;
            if (!this.endingScreen && win) {
                audio.music.pause();
                audio.useKey.play();
            }
            this.endingScreen = true;

            const { canvas, ctx } = this.overlay;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.font = '16px Dogica Pixel';
            const x = 0.5 + Math.round(canvas.width / 2);
            const y = Math.round(canvas.height / 2);
            const dy = Math.round(canvas.height * .08);
            if (win) {
                ctx.fillText('You disabled the missile. Congrats!', x, y - dy);
                ctx.fillText(Math.round(this.time * 100 / 60) / 100 + ' minutes', x, y);
            }
            else {
                ctx.fillText('You failed to disable the missile.', x, y - dy);
                ctx.fillText('The retaliation will start soon.', x, y);
            }
            ctx.fillText('Click to restart', x, y + dy);
            this.overlay.updateUniforms();
            return;
        }

        this.time -= dt;
        player.update(dt);
        this.updateController();
        this.controller.update(dt);

        const { ctx, canvas } = this.overlay;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.font = '16px Dogica Pixel';
        const x = Math.round(32);
        const y = Math.round(canvas.height - 32);
        ctx.fillText(Math.round(this.time * 100 / 60) / 100 + ' minutes left', x, y);
        this.overlay.updateUniforms();
    }


    updateController() {
        if (firstPersonBounds.containsPoint(player.model.position)) {
            if (!this.controller.isFirstPerson) {
                this.controller = this.firstPersonController.init();
            }
        }
        else if (this.controller.isFirstPerson) {
            this.controller = this.fixedCameraController.init();
            this.controller.setZone(fixedCameraZones.find(zone => zone.name === 'Top'));
            player.moveTo(initialToTopPosition);
        }
        const zone = fixedCameraZones.find(zone => zone.bounds.containsPoint(player.model.position));
        if (!zone) return;
        if (!this.controller.isFixedCamera)
            this.controller = this.fixedCameraController.init();
        this.controller.setZone(zone);
    }

    handleMousemove(event) {
        if (this.controller.disabledMissile) return;
        this.controller.handleMousemove?.(event);
    }

    handleMousedown(event) {
        const win = this.controller.disabledMissile;
        const lose = this.time < 0;
        if (win || lose) {
            // this.transitionToMenuContext = true;
            window.location.reload();
            return;
        }
        this.controller.handleMousedown?.(event);
    }

    handleKeydown(event) {
        this.controller.handleKeydown?.(event);
    }

    handleKeyup(event) {
        this.controller.handleKeyup?.(event);
    }
}