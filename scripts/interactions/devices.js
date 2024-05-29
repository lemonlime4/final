import * as THREE from 'three';
import { player } from '../player.js';
import { dialogTime, startInteraction } from '../dialog.js';
import { audio } from '../audio.js';



const cellNeighbors = [[0, 1, 3], [1, 0, 2, 4], [2, 1, 5], [3, 0, 4, 6], [4, 1, 3, 5, 7], [5, 2, 4, 8], [6, 3, 7], [7, 4, 6, 8], [8, 5, 7]];

export class DevicesInteraction {
    constructor({ state, unlockSafeCode }) {
        this.done = false;
        this.walked = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(-0.8, 0, 15.6),
            new THREE.Vector3(0.3, 2.1, 19.2)
        );
        this.completed = false;
        this.state = state;

        this.contents = document.createElement('div');
        this.contents.id = 'devicesInteraction';

        const secretNumber = document.createElement('span');
        secretNumber.textContent = unlockSafeCode
            .reduce((x, y) => x + y, '');
        secretNumber.style.visibility = 'hidden';

        // 3x3 lights out game
        this.cells = cellNeighbors.map(indices => {
            const cell = document.createElement('cell');
            cell.classList.add('cell');
            cell.id = 'cell' + indices[0];
            cell.addEventListener('click', () => {
                if (this.completed) return;
                for (const i of indices) {
                    this.cells[i].classList.toggle('on');
                }
                if (this.cells.every(cell => cell.classList.contains('on'))) {
                    this.completed = true;
                    secretNumber.style.visibility = 'visible';
                }
            })
            this.contents.appendChild(cell);
            return cell;
        })
        this.contents.appendChild(secretNumber);

    }

    init() {
        this.walked = false;
        player.moveTo(new THREE.Vector3(0.7, -0, 17));
    }

    update() {
        if (player.path !== null || this.walked) return;
        this.walked = true;
        if (this.state.devicesPowered) {
            audio.computer.currentTime = 0
            audio.computer.play();
            startInteraction(
                () => this.done = true,
                [this.contents]
            );
        }
        else {
            setTimeout(() => {
                dialogTime('No response.', 2);
                this.done = true;
            }, 500);
        }
    }
}
window.DevicesInteraction = DevicesInteraction;