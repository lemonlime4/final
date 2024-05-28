import * as THREE from 'three';
import { player } from '../player.js';
import { startInteraction } from '../dialog.js';



const cellNeighbors = [[0, 1, 3], [1, 0, 2, 4], [2, 1, 5], [3, 0, 4, 6], [4, 1, 3, 5, 7], [5, 2, 4, 8], [6, 3, 7], [7, 4, 6, 8], [8, 5, 7]];

export class DevicesInteraction {
    constructor({ unlockSafeCode }) {
        this.done = false;
        this.walked = false;
        this.box = new THREE.Box3(
            new THREE.Vector3(-0.8, 0, 15.6),
            new THREE.Vector3(0.3, 2.1, 19.2)
        );
        this.contents = document.createElement('div');
        this.contents.id = 'devicesInteraction';
        this.completed = false;
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
                    this.secretNumber.style.display = 'block';
                }
            })
            this.contents.appendChild(cell);
            return cell;
        })
        this.secretNumber = document.createElement('p');
        this.secretNumber.textContent = unlockSafeCode
            .reduce((x, y) => x + y, '');
        this.secretNumber.style.display = 'none';
    }

    init() {
        this.walked = false;
        player.moveTo(new THREE.Vector3(0.7, -0, 17));
    }

    update() {
        if (player.path !== null || this.walked) return;
        this.walked = true;
        startInteraction(
            () => this.done = true,
            [this.contents, this.secretNumber]
        );
    }
}
window.DevicesInteraction = DevicesInteraction;