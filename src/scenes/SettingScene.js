// src/scenes/HomeScene.js
import Phaser from 'phaser';
import { createCyberBackground } from '../utils/helpers.js';

export default class SettingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingScene' });
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const centerX = screenWidth / 2;

        createCyberBackground(this, screenWidth, screenHeight, 30);

        const backButton = this.add.text(50, 40, '← BACK', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#1e293b',
            padding: { x: 15, y: 8 }
        }).setInteractive({ useHandCursor: true });

        backButton.on('pointerover', () => backButton.setStyle({ fill: '#ffff00', backgroundColor: '#334155' }));
        backButton.on('pointerout', () => backButton.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' }));
        backButton.on('pointerdown', () => {
            this.scene.start('HomeScene');
        });

        this.add.text(centerX, 60, 'SETTINGS', {
            fontSize: '38px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff'
        }).setOrigin(0.5);

        // 操作方法の設定
        this.add.text(centerX, 130, '■ 操作方法の選択', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const keyboardBtn = this.add.text(centerX - 180, 180, '⌨️ キーボード (WASD)', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: operationMode === 'keyboard' ? '#00ffff' : '#ffffff',
            backgroundColor: operationMode === 'keyboard' ? '#1e293b' : '#334155',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const mouseBtn = this.add.text(centerX + 180, 180, '🖱️ マウス / タッチ追従', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: operationMode === 'mouse' ? '#00ffff' : '#ffffff',
            backgroundColor: operationMode === 'mouse' ? '#1e293b' : '#334155',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        keyboardBtn.on('pointerdown', () => {
            operationMode = 'keyboard';
            keyboardBtn.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' });
            mouseBtn.setStyle({ fill: '#ffffff', backgroundColor: '#334155' });
        });

        mouseBtn.on('pointerdown', () => {
            operationMode = 'mouse';
            keyboardBtn.setStyle({ fill: '#ffffff', backgroundColor: '#334155' });
            mouseBtn.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' });
        });

        // プレイヤー移動スピード設定
        this.add.text(centerX, 280, '■ プレイヤーの移動スピード', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const minusBtn = this.add.text(centerX - 140, 340, ' ➖ ', {
            fontSize: '28px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#1e293b',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const speedText = this.add.text(centerX, 340, `${playerSpeed}`, {
            fontSize: '36px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff'
        }).setOrigin(0.5);

        const plusBtn = this.add.text(centerX + 140, 340, ' ➕ ', {
            fontSize: '28px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#1e293b',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        minusBtn.on('pointerdown', () => {
            if (playerSpeed > 1) {
                playerSpeed -= 1;
                speedText.setText(`${playerSpeed}`);
            }
        });

        plusBtn.on('pointerdown', () => {
            if (playerSpeed < 30) {
                playerSpeed += 1;
                speedText.setText(`${playerSpeed}`);
            }
        });
    }
}