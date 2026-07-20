import Phaser from 'phaser';

export class BulletCircle extends Phaser.GameObjects.Arc {
    // constructor(シーン, 中心のX, 中心のY, 進む角度, スピード)
    constructor(scene, startX, startY, angle, speed = 2.5) {
        // 半径12、色は綺麗な水色（0x00ffff）の円形の弾を、指定された中心座標に作成
        super(scene, startX, startY, 12, 0, 360, false, 0x00ffff);
        
        scene.add.existing(this);

        // 💡 角度とスピードから、1フレームあたりに進むXとYの移動量を計算（三角関数）
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.damage = 15; // プレイヤーに与えるダメージ

        // ⏳ 待機用のカウンター（60フレーム ＝ 約1秒間）
        this.delayCounter = 60; 
    }

    update() {
        // 💡 カウンターが残っている間（最初の1秒間）はカウントを減らすだけで動かない
        if (this.delayCounter > 0) {
            this.delayCounter--;
            
            // (任意演出) 待機中は少し弾をピカピカさせたり小さくしても面白いです
            return; 
        }

        // 💡 1秒経ったら（カウンターが0になったら）全方位へ動き出す！
        this.x += this.vx;
        this.y += this.vy;

        // 画面の外に完全にはみ出したら自動で消滅させる
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        if (this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
            this.destroy();
        }
    }
}