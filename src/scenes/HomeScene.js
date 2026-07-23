// src/scenes/HomeScene.js
import Phaser from 'phaser';
import { createCyberBackground } from '../utils/helpers.js';

export default class HomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HomeScene' });
    }

        create() {
        playerHp = maxHp;
        isGameOver = false;
        hitCount = 0; 

        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            try { ytPlayer.stopVideo(); } catch(e) {}
        }
        const playerElement = document.getElementById('youtube-player');
        if (playerElement) {
            playerElement.style.display = 'none'; 
        }

        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        // 🌟 ネオンパーティクル背景（数: 45個）
        createCyberBackground(this, screenWidth, screenHeight, 45);

        // ⚙️ 設定画面ボタン
        const settingButton = this.add.text(screenWidth - 170, 40, '⚙️ SETTINGS', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#1e293b',
            padding: { x: 15, y: 8 }
        }).setInteractive({ useHandCursor: true });

        settingButton.on('pointerover', () => settingButton.setStyle({ fill: '#00ffff', backgroundColor: '#334155' }));
        settingButton.on('pointerout', () => settingButton.setStyle({ fill: '#ffffff', backgroundColor: '#1e293b' }));
        settingButton.on('pointerdown', () => {
            this.scene.start('SettingScene');
        });

        // タイトルロゴ
        const titleText = this.add.text(centerX, centerY - 100, 'Danmaku Tube', { 
            fontSize: '56px', 
            fontFamily: 'Impact, Arial Black, sans-serif',
            fill: '#00ffff',
            stroke: '#ff00ff',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, fill: true }
        }).setOrigin(0.5).setPadding(10); 

        this.tweens.add({
            targets: titleText,
            y: centerY - 115,
            duration: 1800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // スタートボタン
        const startButton = this.add.text(centerX, centerY + 60, '👉 ゲームスタート 👈', { 
            fontSize: '32px', 
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#0f172a',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5);

        const btnBorder = this.add.graphics();
        const updateBtnBorder = () => {
            btnBorder.clear();
            btnBorder.lineStyle(3, 0x00ffff, 1);
            const bounds = startButton.getBounds();
            btnBorder.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
        };
        updateBtnBorder();

        this.tweens.add({
            targets: startButton,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            onUpdate: updateBtnBorder
        });

        startButton.setInteractive({ useHandCursor: true });
        startButton.on('pointerover', () => startButton.setStyle({ fill: '#ffff00', backgroundColor: '#1e293b' }));
        startButton.on('pointerout', () => startButton.setStyle({ fill: '#00ffff', backgroundColor: '#0f172a' }));
        startButton.on('pointerdown', () => {
            btnBorder.destroy();
            this.scene.start('SelectScene');
        });
    }
}