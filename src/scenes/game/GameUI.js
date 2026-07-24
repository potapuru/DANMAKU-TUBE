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

    // 📢 カウントダウン・メッセージ表示の作成
    createStartPrompt(onClick) {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        const startText = this.scene.add.text(centerX, centerY, 'クリックでゲーム開始！', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#0f172a',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(101);

        startText.once('pointerdown', () => {
            startText.destroy();
            onClick();
        });

        return startText;
    }
}