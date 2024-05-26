import * as THREE from 'three';
import { Context } from './interface.js';
import { player } from '../player.js';
import { options } from '../options.js';




const states = {
    initial: 0,
    introduction: 1,
    transition: 2
};


export class MenuContext extends Context {
    constructor({ camera, mouse, overlay, map }) {
        super();
        this.mouse = mouse;
        this.overlay = overlay;
        this.time = 0;
        this.state = states.initial;
        this.newGameHover = false;
        this.newGameBounds = new THREE.Box2();
        this.pixelFontSize = 0;

        player.model.visible = false;
        camera.position.set(-1.1059, 1.2932, 0.002416);
        camera.lookAt(-1.36068, 1.24829, 0);
        camera.fov = 80;
        camera.updateProjectionMatrix();
    }

    exit() {
    }

    update(dt) {
        this.overlay.updateUniforms();
        const { ctx, canvas } = this.overlay;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.textRendering = 'geometricPrecision';

        if (this.state === states.initial) {
            const left = canvas.width / 2 - 0.35 * canvas.height;
            {
                ctx.textBaseline = 'alphabetic';
                ctx.font = 0.08 * window.innerHeight + 'px Bebas Neue';
                ctx.fillText(
                    options.gameTitle,
                    left,
                    canvas.height / 2 - 0.01 * canvas.height
                );
            }
            {
                ctx.textBaseline = 'top';
                ctx.font = this.pixelFontSize + 'px Dogica Pixel';
                ctx.fillText(
                    this.newGameHover ? '> New game' : 'New game',
                    Math.round(left),
                    Math.round(canvas.height / 2 + 0.03 * canvas.height)
                );
            }
        }

        if (this.state === states.introduction) {
            this.time += dt;
            ctx.font = this.pixelFontSize + 'px Dogica Pixel';
            ctx.textBaseline = 'middle';
            const x = Math.round(canvas.width / 2 - 0.35 * canvas.height);
            const y = Math.round(canvas.height / 2 - 0.2 * canvas.height);
            const dy = Math.round(0.1 * canvas.height);

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
                const text = 'You are in a';
                ctx.fillText(
                    text.slice(0, completion * text.length),
                    x, y + 2 * dy
                );
            }
            if (this.time > 4) {
                const completion = Math.min(this.time - 4, 1.5) / 1.5;
                const text = 'missile silo.'
                ctx.fillText(
                    text.slice(0, completion * text.length),
                    x, y + 3 * dy
                );
            }

            if (this.time > 7) {
                ctx.fillText('>>', x, y + 4 * dy)
            };
        }

        if (this.state === states.transition) {
            ;
        }
    }

    handleResize() {
        // this.overlay.updateUniforms();
        const { width, height } = this.overlay.canvas;
        this.pixelFontSize = Math.round(0.025 * window.innerHeight / 8) * 8;
        const a = 0.2 * this.pixelFontSize;
        const b = 1.3 * this.pixelFontSize;
        const y = height / 2 + 0.03 * height;
        const x = width / 2;
        const dx = height * .4;
        this.newGameBounds = new THREE.Box2(
            new THREE.Vector2(x - dx, y - a),
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
            if (this.time > 7) {
                this.state = states.transition;
                this.time = 0;
            }
        }
    }
}