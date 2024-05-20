import { State } from "./interface.js";
import { fixedCameraZones, fpsZone, walkAreas } from "../scene.js";

class GameState extends State {
    constructor({ player, camera, mouse }) {
        super();
        this.player = player;
        this.camera = camera;
        this.mouse = mouse;
        this.controller = null;
        this.zones = fixedCameraZones;
        this.fpsZone = fpsZone;
        this.activeZone = null;
        this.walkAreas = walkAreas;
        this.fpsEuler = new Euler();
        this.keyboard = {
            up: false,
            down: false,
            left: false,
            up: false,
        };
    }

    exit() { }

    update(dt) {
        this.controller.update(dt);
        this.player.update(dt);
    }

    handleClick(e) {
        this.controller.handleClick(event);
    }

    handleMousemove() {
        ;
    }

    handleKeydown() {
        ;
    }
}