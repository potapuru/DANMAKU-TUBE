import Phaser from 'phaser';
import { BulletConfig } from './BulletConfig.js';

export class BulletRight extends Phaser.GameObjects.Arc {
    constructor(scene, customY) {
        // 出現位置は画面の一番左
        const startX = -20;
        // Y座標が指定されていればそれを使用、なければ画面の縦中央
        const startY = customY !== undefined ? customY : scene.cameras.main.height / 2;

        const config = BulletConfig.right;
        // オレンジ色の弾にします (半径12)
        super(scene, startX, startY, config.radius, 0, 360, false, config.color);
        
        scene.add.existing(this);

        this.speedY = config.speedY;
        this.speedX = config.speedX; // 【重要】右に進めるためにプラスにします
        this.damage = config.damage;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // 画面の右端からはみ出したら消滅
        if (this.x > this.scene.cameras.main.width + 20) {
            this.destroy();
        }
    }
}