import Phaser from 'phaser';
import { BulletConfig } from './BulletConfig.js';

export class BulletLaser extends Phaser.GameObjects.Container {
    // customPos: ラインの場所(XまたはY座標), type: 'vertical'(縦) または 'horizontal'(横)
    constructor(scene, customPos, laserType = 'vertical') {
        
        super(scene, 0, 0);
        
        this.laserType = laserType;
        this.customPos = customPos !== undefined ? customPos : 300;
        this.scene = scene;
        this.config = BulletConfig.laser;

        // ⚙️ ステート管理 (0: 警告中, 1: レーザー発射中)
        this.state = 0; 
        this.timeCounter = 0;
        this.damage = this.config.damage; // レーザーは連続ヒットするので1フレームあたりのダメージを低めに設定

        // 📐 画面のサイズを取得
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;

        // 1. 警告用の点線 (Graphics) を作成
        this.warningLine = scene.add.graphics();
        this.warningLine.lineStyle(2, 0xff0000, 1); // 赤色の太さ2の線
        
        // 点線を描画
        const dashLength = 10;
        const gapLength = 10;

        if (this.laserType === 'vertical') {
            // 縦ラインの点線
            for (let y = 0; y < height; y += dashLength + gapLength) {
                this.warningLine.lineBetween(this.customPos, y, this.customPos, y + dashLength);
            }
        } else {
            // 横ラインの点線
            for (let x = 0; x < width; x += dashLength + gapLength) {
                this.warningLine.lineBetween(x, this.customPos, x + dashLength, this.customPos);
            }
        }
        this.add(this.warningLine);

        // 2. 本番のレーザー本体 (Graphics) を作成 (最初は見えなくしておく)
        this.laserBeam = scene.add.graphics();
        this.laserBeam.setVisible(false);
        this.add(this.laserBeam);

        scene.add.existing(this);
    }

    update() {
        this.timeCounter += 1;

        // 💡 2秒間（60fps × 2秒 = 120フレーム）は警告を出す
        if (this.state === 0 && this.timeCounter >= this.config.warningDuration) {
            this.state = 1; // レーザー発射ステートへ
            this.timeCounter = 0;
            
            this.warningLine.setVisible(false); // 警告線を消す
            this.laserBeam.setVisible(true);   // レーザーを表示

            // レーザーの極太ビームを描画 (中心が黄色、外側が赤色のカッコいいグラデーション風)
            const width = this.scene.cameras.main.width;
            const height = this.scene.cameras.main.height;
            const laserWidth = this.config.laserWidth; // レーザーの太さ

            this.laserBeam.fillStyle(0xff0000, 0.5); // 外側の赤いオーラ
            if (this.laserType === 'vertical') {
                this.laserBeam.fillRect(this.customPos - laserWidth/2, 0, laserWidth, height);
                this.laserBeam.fillStyle(0xffffff, 0.9); // 内側の白い芯
                this.laserBeam.fillRect(this.customPos - 6, 0, 12, height);
            } else {
                this.laserBeam.fillRect(0, this.customPos - laserWidth/2, width, laserWidth);
                this.laserBeam.fillStyle(0xffffff, 0.9); // 内側の白い芯
                this.laserBeam.fillRect(0, this.customPos - 6, width, 12);
            }
        }

        // 💡 レーザー発射後、1秒間（60フレーム）経ったら消滅させる
        if (this.state === 1 && this.timeCounter >= this.config.beamDuration) {
            this.destroy();
        }
    }

    // 💡 レーザー専用の当たり判定チェック関数
    checkCollision(playerX, playerY, playerRadius) {
        // 警告中（state === 0）は当たり判定ナシ
        if (this.state === 0) return false;

        const laserWidth = this.config.laserWidth; // レーザーの太さ範囲
        
        if (this.laserType === 'vertical') {
            // 縦レーザーの横幅の中にプレイヤーが入っているか
            return (playerX + playerRadius > this.customPos - laserWidth/2 && 
                    playerX - playerRadius < this.customPos + laserWidth/2);
        } else {
            // 横レーザーの縦幅の中にプレイヤーが入っているか
            return (playerY + playerRadius > this.customPos - laserWidth/2 && 
                    playerY - playerRadius < this.customPos + laserWidth/2);
        }
    }
}