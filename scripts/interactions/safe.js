import * as THREE from 'three';
import { player } from '../player.js';
import { startInteraction } from '../dialog.js';
import { audio } from '../audio.js';


export class SafeInteraction {
    constructor({ state, unlockSafeCode }) {
        this.done = false;
        this.walked = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(0.2, 0, 11.5),
            new THREE.Vector3(1, 1.1, 12.3)
        );

        this.contents = new DOMParser().parseFromString(`
        <div id="safeInteraction">
            <button class="up" id="up0"></button>
            <button class="up" id="up1"></button>
            <button class="up" id="up2"></button>
            <button class="up" id="up3"></button>
            <span class="digit" id="digit0">0</span>
            <span class="digit" id="digit1">0</span>
            <span class="digit" id="digit2">0</span>
            <span class="digit" id="digit3">0</span>
            <button class="down" id="down0"></button>
            <button class="down" id="down1"></button>
            <button class="down" id="down2"></button>
            <button class="down" id="down3"></button>
        </div>
        `, 'text/html').body.firstChild;
        this.digits = [];

        this.safeUnlocked = false;
        const unlockMessage = document.createElement('span');
        unlockMessage.textContent = 'Unlocked';
        unlockMessage.style.visibility = 'hidden';
        this.contents.appendChild(unlockMessage);

        // implicitly convert textContent to number
        const checkFinished = () => {
            if (this.digits[0].textContent == unlockSafeCode[0] &&
                this.digits[1].textContent == unlockSafeCode[1] &&
                this.digits[2].textContent == unlockSafeCode[2] &&
                this.digits[3].textContent == unlockSafeCode[3]) {
                this.safeUnlocked = true;
                unlockMessage.style.visibility = 'visible';
                state.hasKey = true;
                state.update();
                audio.getKey.currentTime = 0;
                audio.getKey.play();
            }
        }
        const changeListener = (offset, indices) => () => {
            if (this.safeUnlocked) return;
            for (const i of indices) {
                const n = 1 * this.digits[i].textContent;
                this.digits[i].textContent = (((n + offset) % 10) + 10) % 10; // n + offset mod 10
            }
            checkFinished();
        };
        for (const indices of [[0, 1], [1, 0, 2], [2, 1, 3], [3, 2]]) {
            this.digits[indices[0]] = this.contents.querySelector('#digit' + indices[0]);
            this.contents.querySelector('#up' + indices[0])
                .addEventListener('click', changeListener(1, indices));
            this.contents.querySelector('#down' + indices[0])
                .addEventListener('click', changeListener(-1, indices));
        }
    }

    init() {
        this.walked = false;
        player.moveTo(new THREE.Vector3(1.4, 0, 11.9));
    }

    update() {
        if (player.path !== null || this.walked) return;
        this.walked = true;
        startInteraction(
            () => this.done = true,
            [this.contents]
        );
    }
}