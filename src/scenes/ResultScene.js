// src/scenes/HomeScene.js
import Phaser from 'phaser';
import { createCyberBackground } from '../utils/helpers.js';

export default class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        createCyberBackground(this, screenWidth, screenHeight, 30);

        const score = Math.floor((playerHp / maxHp) * 100);

        this.add.text(centerX, centerY - 150, '🎉 GAME CLEAR 🎉', {
            fontSize: '48px',
            fill: '#ffff00',
            fontWeight: 'bold'
        }).setOrigin(0.5).setPadding(10);

        this.add.text(centerX, centerY - 40, `得点: ${score} 点`, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 20, `被弾数: ${hitCount} 回`, {
            fontSize: '24px',
            fill: '#ffaaaa'
        }).setOrigin(0.5);

        const homeButton = this.add.text(centerX, centerY + 120, 'ホーム画面に戻る', {
            fontSize: '26px',
            fill: '#00ffff',
            backgroundColor: '#222',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        homeButton.setInteractive({ useHandCursor: true });
        homeButton.on('pointerover', () => homeButton.setStyle({ fill: '#ffff00', backgroundColor: '#444' }));
        homeButton.on('pointerout', () => homeButton.setStyle({ fill: '#00ffff', backgroundColor: '#222' }));
        homeButton.on('pointerdown', () => {
            this.scene.start('HomeScene');
        });
    }
}