import * as THREE from 'three';
import { player } from '../player.js';
import { options } from '../options.js';
import { map } from '../scene.js';
import {
    walkInteractions,
    WalkInteraction,
    DrawerInteraction,
    DevicesInteraction,
    TopDoorInteraction,
    StorageDoorInteraction,
    StorageExitInteraction,
    PapersInteraction,
    SafeInteraction,
    ElectricalPanelInteraction,
    ThingInteraction,
} from '../interactions/interactions.js';

export class FixedCameraController {
    constructor({ postShader, camera, mouse, overlay, unlockSafeCode, state }) {
        this.isFixedCamera = true;
        this.camera = camera;
        this.mouse = mouse;
        this.overlay = overlay;
        this.raycaster = new THREE.Raycaster();

        this.state = state;
        this.unlockSafeCode = unlockSafeCode;
        this.interactions = [
            new DevicesInteraction(this),
            new DrawerInteraction(this),
            new ElectricalPanelInteraction(this),
            new PapersInteraction(this),
            new SafeInteraction(this),
            new StorageDoorInteraction(this),
            new StorageExitInteraction(this),
            new ThingInteraction(this),
            new TopDoorInteraction(this),
        ];

        this.interaction = null;

        document.exitPointerLock();
        postShader.uniforms.controlIconState.value = 2;
        player.model.visible = true;
        player.stopWalking();
        camera.fov = options.fov;
        camera.updateProjectionMatrix();
    }

    setZone(zone) {
        this.zoneName = zone.name;
        this.camera.position.copy(zone.camera.from);
        this.camera.lookAt(zone.camera.to);
    }

    update(dt) {
        player.update(dt);
        if (this.interaction) {
            if (this.interaction.done) {
                this.interaction.done = false;
                this.interaction = null;
            }
            else this.interaction.update(dt);
        }
    }

    handleKeydown(event) {
        if (event.code === 'Esc' && this.interaction)
            this.interaction.done = true;
    }

    handleMousedown() {
        if (this.interaction && !this.interaction.cancellable)
            return;
        const hovered = this.handleMousemove();
        if (hovered) {
            hovered.init();
            this.interaction = hovered;
            document.body.classList.remove(...document.body.classList);
        }
    }

    handleMousemove() {
        if (this.interaction)
            return;

        // raycast and determine appropriate cursor
        const screenspaceMouse = new THREE.Vector2(
            -1 + 2 * this.mouse.position.x / this.overlay.canvas.width,
            +1 - 2 * this.mouse.position.y / this.overlay.canvas.height
        );
        this.raycaster.setFromCamera(screenspaceMouse, this.camera);
        const ray = this.raycaster.ray;

        // intersecting the scene, walk interactions and other interactions
        const sceneIntersects = this.raycaster.intersectObject(map);

        const walkIntersect = walkInteractions.reduce((closest, current) => {
            const pos = ray.intersectBox(current.box, new THREE.Vector3());
            if (pos === null) return closest;
            const distance = pos.distanceTo(ray.origin);
            if (distance > closest.distance) return closest;
            return { distance, targets: current.targets };
        }, { distance: Infinity, targets: null });

        const interactionIntersect = this.interactions.reduce((closest, current) => {
            const pos = ray.intersectBox(current.box, new THREE.Vector3());
            if (pos === null) return closest;
            const distance = pos.distanceTo(ray.origin);
            if (distance > closest.distance) return closest;
            return { distance, interaction: current };
        }, { distance: Infinity, interaction: null });

        const closestIntersect = [
            sceneIntersects.length === 0 ? null : {
                cursor: [],
                distance: sceneIntersects[0].distance,
                interaction: new WalkInteraction(sceneIntersects[0].point),
            },
            walkIntersect.targets === null ? null : {
                cursor: ['walkCursor'],
                distance: walkIntersect.distance,
                interaction: new WalkInteraction(walkIntersect.targets.get(this.zoneName))
            },
            interactionIntersect.interaction === null ? null : {
                cursor: [interactionIntersect.interaction.cursor ?? 'interactCursor'],
                distance: interactionIntersect.distance,
                interaction: interactionIntersect.interaction
            }
        ].reduce((closest, current) => {
            if (current === null) return closest;
            if (closest === null) return current;
            if (current.distance < closest.distance) return current;
            return closest;
        }, null);
        document.body.classList.remove(...document.body.classList);
        if (closestIntersect)
            document.body.classList.add(...closestIntersect.cursor);
        return closestIntersect?.interaction;
    }
};