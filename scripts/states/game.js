import { State } from "./interface.js";
import { fixedCameraZones, fpsZone } from "../scene.js";

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
        this.controller.update();
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