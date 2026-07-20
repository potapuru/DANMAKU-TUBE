import Phaser from 'phaser';
import { BulletConfig } from './BulletConfig.js';

export class BulletDown extends Phaser.GameObjects.Arc {
    constructor(scene, customX) {
        const startX = customX !== undefined ? customX : scene.cameras.main.width / 2;
        const startY = -20;

        const config = BulletConfig.down;

        // 水色の弾にします (半径12)
        super(scene, startX, startY, config.radius, 0, 360, false, config.color);
        
        scene.add.existing(this);

        this.speedY = config.speedY;
        this.speedX = config.speedX;
        this.damage = config.damage;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        if (this.y > this.scene.cameras.main.height + 20) {
            this.destroy();
        }
    }
}