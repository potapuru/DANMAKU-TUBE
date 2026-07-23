// src/utils/helpers.js
import Phaser from 'phaser';

// 🌐 ゲーム共有状態
export let playerHp = 10000;
export const maxHp = 10000;
export let isGameOver = false;
export let hitCount = 0;

export let ytPlayer = null;
export let currentSong = null;

export let operationMode = 'mouse'; // 'mouse' | 'keyboard'
export let playerSpeed = 20;

// Setter関数
export function setPlayerHp(value) {
    if (typeof value === 'function') {
        playerHp = value(playerHp);
    } else {
        playerHp = value;
    }
}

export function setIsGameOver(value) {
    isGameOver = value;
}

export function setHitCount(value) {
    if (typeof value === 'function') {
        hitCount = value(hitCount);
    } else {
        hitCount = value;
    }
}

export function setYtPlayer(player) {
    ytPlayer = player;
}

export function setCurrentSong(song) {
    currentSong = song;
}

export function setOperationMode(mode) {
    operationMode = mode;
}

export function setPlayerSpeed(speed) {
    playerSpeed = speed;
}

// 動画時間取得
export function getYoutubeCurrentTimeMS() {
    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        return ytPlayer.getCurrentTime() * 1000;
    }
    return 0;
}

// 🌟 サイバー背景
export function createCyberBackground(scene, width, height, count = 45) {
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