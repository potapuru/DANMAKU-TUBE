import Phaser from 'phaser';
import { BulletConfig } from './BulletConfig.js';

export class BulletLeft extends Phaser.GameObjects.Arc {
    // 💡 左右移動の弾なので、指定する位置を「customY」に変えています
    constructor(scene, customY) {
        // 出現位置は画面の一番右
        const startX = scene.cameras.main.width + 20;
        // Y座標が指定されていればそれを使用、なければ画面の縦中央
        const startY = customY !== undefined ? customY : scene.cameras.main.height / 2;

        const config = BulletConfig.left;
        // ピンク色の弾にします (半径12)
        super(scene, startX, startY, config.radius, 0, 360, false, config.color);
        
        scene.add.existing(this);

        this.speedY = config.speedY;
        this.speedX = config.speedX; // 【重要】左に進めるためにマイナスにします
        this.damage = config.damage;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // 画面の左端からはみ出したら消滅
        if (this.x < -20) {
            this.destroy();
        }
    }
}