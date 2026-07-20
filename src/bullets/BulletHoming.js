import Phaser from 'phaser';
import { BulletConfig } from './BulletConfig.js';

export class BulletHoming extends Phaser.GameObjects.Arc {
    // 🛠️【修正】引数の後ろに customSpeed と customTurnSpeed を追加します
    constructor(scene, customX, customY, customSpeed, customTurnSpeed) {
        
        // X座標：指定があればそれ、なければ画面中央
        const startX = customX !== undefined ? customX : scene.cameras.main.width / 2;
        // Y座標：画面の外（上端よりさらに20ピクセル上）から登場
        const startY = customY !== undefined ? customY : -20;

        const config = BulletConfig.homing;

        // 不気味な紫色（0xff00ff）の弾（半径10）
        super(scene, startX, startY, config.radius, 0, 360, false, config.color);
        
        scene.add.existing(this);

        // ⚙️ パラメータ設定
        // 🛠️【修正】値が渡されてきていればそれを使い、なければデフォルト値にします
        this.speed = customSpeed !== undefined ? customSpeed : config.speed;           // 弾の進む速さ
        this.turnSpeed = customTurnSpeed !== undefined ? customTurnSpeed : config.turnSpeed;    // 弾が曲がる強さ（旋回速度）

        // 発射された（生まれた）瞬間に、画面外からでもプレイヤーのいる方向を正確に計算してロックオンします！
        const player = scene.children.list.find(child => child.fillColor === 0xff0000); // 赤い自機を探す
        if (player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            this.angleRad = Math.atan2(dy, dx); // 最初からプレイヤーの方向を向かせる
        } else {
            this.angleRad = Math.PI / 2; // 自機がいなければ真下に進む
        }

        this.damage = config.damage; // ダメージ量
    }

    update() {
        // (※ update の中身は今のままで一切変更しなくて大丈夫です！)
        const player = this.scene.children.list.find(child => child.fillColor === 0xff0000);

        if (player) {
            const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
            this.angleRad = Phaser.Math.Angle.Wrap(this.angleRad);
            this.angleRad = Phaser.Math.Angle.RotateTo(this.angleRad, targetAngle, this.turnSpeed);
        }

        this.x += Math.cos(this.angleRad) * this.speed;
        this.y += Math.sin(this.angleRad) * this.speed;

        const margin = 50;
        if (this.x < -margin || 
            this.x > this.scene.cameras.main.width + margin ||
            this.y < -margin || 
            this.y > this.scene.cameras.main.height + margin) {
            this.destroy();
        }
    }
}