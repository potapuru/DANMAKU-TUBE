// src/utils/helpers.js
import Phaser from 'phaser';

export let operationMode = 'mouse';
export let playerSpeed = 20;

export function setOperationMode(mode) {
    operationMode = mode;
}

export function setPlayerSpeed(speed) {
    playerSpeed = speed;
}

export function getYoutubeCurrentTimeMS(ytPlayer) {
    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        return ytPlayer.getCurrentTime() * 1000;
    }
    return 0;
}