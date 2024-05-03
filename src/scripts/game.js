import { makeEnum } from './enum.js';

const gameStates = makeEnum('game state', [
    'menu',
    'active',
    'paused',
]);

export const game = {
    state: gameStates.active,
};