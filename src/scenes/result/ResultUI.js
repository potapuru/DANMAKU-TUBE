import { playerHp, maxHp, hitCount } from '../../utils/helpers.js';

export class ResultUI {
    constructor(scene) {
        this.scene = scene;
    }

    create() {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        this.createTitle(centerX, centerY - 150);
        this.createScoreDisplay(centerX, centerY);
        this.createHomeButton(centerX, centerY + 120);
    }

    // 🎊 タイトル表示
    createTitle(x, y) {
        this.scene.add.text(x, y, '🎉 GAME CLEAR 🎉', {
            fontSize: '48px',
            fontFamily: 'Arial',
            fill: '#ffff00',
            fontWeight: 'bold'
        }).setOrigin(0.5).setPadding(10);
    }

    // 📊 得点 & 被弾数表示
    createScoreDisplay(centerX, centerY) {
        const score = Math.floor((playerHp / maxHp) * 100);

        // 得点
        this.scene.add.text(centerX, centerY - 40, `得点: ${score} 点`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // 被弾数
        this.scene.add.text(centerX, centerY + 20, `被弾数: ${hitCount} 回`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#ffaaaa'
        }).setOrigin(0.5);
    }

    // 🏠 ホームに戻るボタン
    createHomeButton(x, y) {
        const homeButton = this.scene.add.text(x, y, 'ホーム画面に戻る', {
            fontSize: '26px',
            fontFamily: 'Arial',
            fill: '#00ffff',
            backgroundColor: '#222222',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        homeButton.on('pointerover', () => homeButton.setStyle({ fill: '#ffff00', backgroundColor: '#444444' }));
        homeButton.on('pointerout', () => homeButton.setStyle({ fill: '#00ffff', backgroundColor: '#222222' }));
        homeButton.on('pointerdown', () => {
            this.scene.scene.start('HomeScene');
        });
    }
}