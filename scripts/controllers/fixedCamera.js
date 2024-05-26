import * as THREE from 'three';
import { player } from '../player.js';
import { options } from '../options.js';
import { walkInteractions } from '../scene.js';

export class FixedCameraController {
    constructor({ camera, mouse, map, overlay }) {
        console.log('switch to fixed camera');
        this.isFixedCamera = true;
        this.camera = camera;
        this.mouse = mouse;
        this.map = map;
        this.overlay = overlay;
        this.raycaster = new THREE.Raycaster();
        this.interaction = null;

        player.model.visible = true;
        player.stopWalking();
        camera.fov = options.fov;
        camera.updateProjectionMatrix();
    }

    update(dt) {
        player.update(dt);
    }

    setZone(zone) {
        this.zoneName = zone.name;
        this.camera.position.copy(zone.camera.from);
        this.camera.lookAt(zone.camera.to);
    }

    handleMousedown() {
        const sceneIntersects = this.raycaster.intersectObject(this.map);
        if (sceneIntersects.length > 0) {
            player.moveTo(sceneIntersects[0].point);
        }
        const ray = this.raycaster.ray;
        const walkIntersect = walkInteractions
            .reduce((closest, interaction) => {
                const pos = ray.intersectBox(interaction.box, new THREE.Vector3());
                if (pos === null) return closest;
                const distance = pos.distanceTo(ray.origin);
                if (distance > closest.distance) return closest;
                return { distance, interaction };
            }, { distance: Infinity, interaction: null });

        if (walkIntersect.interaction === null) return;
        player.moveTo(walkIntersect.interaction.target
            .get(this.zoneName));
    }

    handleMousemove() {
        const screenspaceMouse = new THREE.Vector2(
            -1 + 2 * this.mouse.position.x / this.overlay.canvas.width,
            +1 - 2 * this.mouse.position.y / this.overlay.canvas.height
        );
        this.raycaster.setFromCamera(screenspaceMouse, this.camera);
    }
};