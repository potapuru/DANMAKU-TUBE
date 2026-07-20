import Phaser from 'phaser';
import { BulletConfig } from './BulletConfig.js';

export class BulletUp extends Phaser.GameObjects.Arc {
    constructor(scene, customX) {
        const startX = customX !== undefined ? customX : scene.cameras.main.width / 2;
        const startY = scene.cameras.main.height + 20;

        const config = BulletConfig.up;

        // 黄緑色の弾にします (半径12)
        super(scene, startX, startY, config.radius, 0, 360, false, config.color);
        
        scene.add.existing(this);

        this.speedY = config.speedY; // 【重要】上に進めるためにマイナスにします
        this.speedX = config.speedX;
        this.damage = config.damage;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        if (this.y < -20) {
            this.destroy();
        }
    }
}