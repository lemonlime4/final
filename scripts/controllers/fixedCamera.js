import * as THREE from 'three';
import { player } from '../player.js';
import { options } from '../options.js';
import { Controller } from './interface.js';

export class FixedCameraController extends Controller {
    constructor({ camera, mouse }) {
        this.camera = camera;
    }
};