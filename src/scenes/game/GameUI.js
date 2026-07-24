import { playerHp, maxHp } from '../../utils/helpers.js';
import Phaser from 'phaser';

export class GameUI {
    constructor(scene) {
        this.scene = scene;
        this.hpBarGraphics = null;
    }

    // 💚 HPゲージの作成
    createHpBar() {
        this.hpBarGraphics = this.scene.add.graphics();
        this.hpBarGraphics.setDepth(100);
        this.drawHpBar();
    }

    // 🎨 HPゲージの再描画
    drawHpBar() {
        if (!this.hpBarGraphics) return;

        this.hpBarGraphics.clear();
        const barWidth = 400;
        const barHeight = 20;
        const x = (this.scene.cameras.main.width - barWidth) / 2;
        const screenHeight = this.scene.cameras.main.height;
        const y = screenHeight - 50;

        // 背景（黒）
        this.hpBarGraphics.fillStyle(0x000000, 0.6);
        this.hpBarGraphics.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        // HP割合計算
        const hpRatio = Phaser.Math.Clamp(playerHp / maxHp, 0, 1);
        let color = 0x00ff00; // 緑
        if (hpRatio < 0.2) color = 0xff0000;      // 赤
        else if (hpRatio < 0.5) color = 0xffff00; // 黄

        // バー本体
        this.hpBarGraphics.fillStyle(color, 1);
        this.hpBarGraphics.fillRect(x, y, barWidth * hpRatio, barHeight);

        // 枠線
        this.hpBarGraphics.lineStyle(2, 0xffffff, 1);
        this.hpBarGraphics.strokeRect(x, y, barWidth, barHeight);
    }

    // 📢 スタートプロンプト（クリックで消去）
    createStartPrompt(onClick) {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        // 🌟 画面全域をカバーする透明なクリックゾーンを作成
        const fullScreenZone = this.scene.add.zone(centerX, centerY, screenWidth, screenHeight)
            .setInteractive({ useHandCursor: true })
            .setDepth(200);

        const startText = this.scene.add.text(centerX, centerY, '画面をクリック / スペースキーで開始', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setDepth(201);

        // 点滅表示アニメーション
        const tween = this.scene.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        // 開始処理（1度だけ実行）
        const handleStart = () => {
            fullScreenZone.destroy();
            startText.destroy();
            tween.stop();

            if (typeof onClick === 'function') {
                onClick();
            }
        };

        fullScreenZone.once('pointerdown', handleStart);

        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.once('keydown-SPACE', handleStart);
        }
    }
}