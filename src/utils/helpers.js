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
//ネオネオンのような後ろの模様をつくる
export function createCyberBackground(scene, width, height, count = 70) {
    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x3b82f6];

    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(0, height);
        const size = Phaser.Math.Between(3, 8);
        const color = Phaser.Utils.Array.GetRandom(colors);
        const alpha = Phaser.Math.FloatBetween(0.2, 0.7);

        const particle = scene.add.circle(x, y, size, color, alpha);

        scene.tweens.add({
            targets: particle,
            y: y - Phaser.Math.Between(150, 400),
            x: x + Phaser.Math.Between(-50, 50),
            alpha: 0,
            duration: Phaser.Math.Between(3000, 7000),
            ease: 'Sine.easeOut',
            repeat: -1,
            repeatDelay: Phaser.Math.Between(100, 1500),
            onRepeat: (tween, target) => {
                target.x = Phaser.Math.Between(0, width);
                target.y = height + 20;
                target.alpha = Phaser.Math.FloatBetween(0.2, 0.7);
            }
        });
    }
}