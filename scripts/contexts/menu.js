import * as THREE from 'three';
import { Context } from './interface.js';
import { audio } from '../audio.js';
import { player } from '../player.js';
import { options } from '../options.js';
import { startInteraction } from '../dialog.js';



const states = {
    initial: 0,
    introduction: 1,
    alarm: 2,
    transition: 3,
};


export class MenuContext extends Context {
    constructor({ camera, mouse, overlay, postShader }) {
        super();
        this.camera = camera;
        this.mouse = mouse;
        this.overlay = overlay;
        this.postShader = postShader;
        this.time = 0;
        this.state = states.initial;
        this.newGameHover = false;
        this.newGameBounds = new THREE.Box2();
        this.pixelFontSize = 0;
        this.transitionToGameContext = false;

        postShader.uniforms.controlIconState.value = 0;
        player.model.visible = false;
        camera.position.set(-1.1059, 1.2932, 0.002416);
        camera.lookAt(-1.36068, 1.24829, 0);
        camera.fov = 80;
        camera.updateProjectionMatrix();

        this.oldCamera = {
            position: camera.position.clone(),
            quaternion: camera.quaternion.clone(),
            fov: camera.fov
        };
        this.targetCameraPosition = new THREE.Vector3();
        this.targetCameraPosition.y = options.firstPersonHeight;
        this.handleResize();

        audio.music.pause();

        this.canPlayAudio = false;
        const message = document.createElement('p');
        message.textContent = 'Click this page and then press [Esc] to start the game with audio.';
        startInteraction(
            () => {
                this.canPlayAudio = true
                audio.background.currentTime = 0;
                audio.background.play();
            },
            [message]
        );
    }



    update(dt) {
        if (!this.canPlayAudio) return;


        this.overlay.updateUniforms();
        const { ctx, canvas } = this.overlay;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.textRendering = 'geometricPrecision';

        if (this.state === states.initial) {
            const left = canvas.width / 2 - 0.35 * canvas.height;
            {
                ctx.textBaseline = 'alphabetic';
                ctx.font = 0.16 * window.innerHeight * options.pixelRatio + 'px Bebas Neue';
                ctx.fillText(
                    options.gameTitle,
                    left,
                    canvas.height / 2 - 0.03 * canvas.height
                );
            }
            {
                ctx.textBaseline = 'top';
                ctx.font = this.pixelFontSize + 'px Dogica Pixel';
                ctx.fillText('by Shida Zheng',
                    Math.round(left),
                    Math.round(canvas.height / 2))
                ctx.fillText(
                    this.newGameHover ? '> New game' : 'New game',
                    Math.round(left),
                    Math.round(canvas.height / 2 + 0.08 * canvas.height)
                );
            }
        }

        if (this.state === states.introduction) {
            this.time += dt;
            ctx.font = this.pixelFontSize + 'px Dogica Pixel';
            ctx.textBaseline = 'middle';
            const x = Math.round(canvas.width / 2 - 0.35 * canvas.height);
            const y = Math.round(canvas.height / 2 - 0.2 * canvas.height);
            const dy = Math.round(0.08 * canvas.height);

            if (this.time > 1) {
                const completion = Math.min(this.time - 1, 1);
                const text = 'The year is 1983.';
                ctx.fillText(
                    text.slice(0, completion * text.length),
                    x, y
                );
            }

            if (this.time > 3) {
                const completion = Math.min(this.time - 3, 1);
                const text = 'You are in an';
                ctx.fillText(
                    text.slice(0, completion * text.length),
                    x, y + 2 * dy
                );
            }
            if (this.time > 4) {
                const completion = Math.min(this.time - 4, 0.8) / 0.8;
                const text = 'underground'
                ctx.fillText(
                    text.slice(0, completion * text.length),
                    x, y + 3 * dy
                );
            }
            if (this.time > 4.8) {
                const completion = Math.min(this.time - 4.8, 0.8) / 0.8;
                const text = 'bunker.'
                ctx.fillText(
                    text.slice(0, completion * text.length),
                    x, y + 4 * dy
                );
            }
            if (this.time > 5.6) {
                ctx.fillText('>>', x, y + 5 * dy)
            }
        }

        if (this.state === states.alarm) {
            this.time += dt;

            if (0 < this.time && this.time < 0.5 ||
                1 < this.time && this.time < 1.5 ||
                2 < this.time && this.time < 2.5) {
                this.postShader.uniforms.alarmed.value = true;
                console.log('alarm');
            }
            else {
                this.postShader.uniforms.alarmed.value = false;
            }
            if (this.time > 3) {
                audio.stopAlarm.currentTime = 0;
                audio.stopAlarm.play();
                this.state = states.transition;
                this.time = 0;
            }
        }

        if (this.state === states.transition) {
            this.time += dt;
            const t = Math.min(1, this.time / 1.5);
            this.camera.position.lerpVectors(
                this.oldCamera.position,
                this.targetCameraPosition,
                t
            );
            this.camera.fov = this.oldCamera.fov * (1 - t)
                + options.firstPersonFov * t;
            this.camera.updateProjectionMatrix();
            if (this.time > 1.5) this.transitionToGameContext = true;
        }
    }

    handleResize() {
        const { width, height } = this.overlay.canvas;
        this.pixelFontSize = Math.round(0.05 * window.innerHeight * options.pixelRatio / 8) * 8;
        const a = .9 * this.pixelFontSize;
        const b = 2.5 * this.pixelFontSize;
        const y = height / 2 + 0.03 * height;
        const x = width / 2;
        const dx = height * .4;
        this.newGameBounds = new THREE.Box2(
            new THREE.Vector2(x - dx, y + a),
            new THREE.Vector2(x + .9 * dx, y + b)
        );
    }

    handleMousemove() {
        if (this.state !== states.initial) return;
        this.newGameHover = this.newGameBounds
            .containsPoint(this.mouse.position);
    }

    handleMousedown() {
        if (this.state === states.initial) {
            if (this.newGameBounds.containsPoint(this.mouse.position))
                this.state = states.introduction;
        }
        if (this.state === states.introduction) {
            if (this.time > 3) {
                this.time = 0;
                this.state = states.alarm;
                audio.background.pause();
                audio.alarm.currentTime = 0;
                audio.alarm.play();
            }
        }
    }
}