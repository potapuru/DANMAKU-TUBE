// src/scenes/HomeScene.js
import Phaser from 'phaser';
import { createCyberBackground } from '../utils/helpers.js';

export default class SelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectScene' });
    }

    preload() {
        this.load.crossOrigin = 'anonymous';

        songList.forEach(song => {
            if (song.youtubeId) {
                const thumbUrl = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
                this.load.image(`thumb_${song.youtubeId}`, thumbUrl);
            }
        });
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const centerX = screenWidth / 2;

        // 🌟 曲選択画面にもネオンパーティクルを追加！
        // 💡 45 の数字を変えることでパーティクルの量を調整できます
        createCyberBackground(this, screenWidth, screenHeight, 45);

        // 🔙 戻るボタン
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

        // タイトル
        this.add.text(centerX, 60, 'SELECT MUSIC', {
            fontSize: '38px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff'
        }).setOrigin(0.5);

        // 配置計算
        const columns = 4;
        const cardWidth = 240;
        const cardHeight = 190;
        const gapX = 25;
        const gapY = 30;

        const viewY = 130;
        const viewHeight = screenHeight - viewY - 40;

        const totalGridWidth = (cardWidth * columns) + (gapX * (columns - 1));
        const startX = (screenWidth - totalGridWidth) / 2 + (cardWidth / 2); 
        const startY = cardHeight / 2 + 10;

        const scrollContainer = this.add.container(0, viewY);

        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect((screenWidth - totalGridWidth) / 2 - 20, viewY, totalGridWidth + 40, viewHeight);
        const mask = maskShape.createGeometryMask();
        scrollContainer.setMask(mask);

        // 曲カード作成
        songList.forEach((song, index) => {
            const col = index % columns;             
            const row = Math.floor(index / columns); 

            const posX = startX + col * (cardWidth + gapX);
            const posY = startY + row * (cardHeight + gapY);

            const cardContainer = this.add.container(posX, posY);
            scrollContainer.add(cardContainer);

            const bgGlow = this.add.graphics();
            bgGlow.fillStyle(0x0f172a, 0.85); // パーティクルが見やすいよう半透明ダーク背景
            bgGlow.lineStyle(2, 0x334155, 1);
            bgGlow.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
            bgGlow.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);

            let thumbnail;
            if (this.textures.exists(`thumb_${song.youtubeId}`)) {
                thumbnail = this.add.image(0, -20, `thumb_${song.youtubeId}`);
                thumbnail.setDisplaySize(220, 124);
            } else {
                thumbnail = this.add.grid(0, -20, 220, 124, 20, 20, 0x000000);
            }

            const titleText = this.add.text(0, 55, song.title || 'Unknown Title', {
                fontSize: '15px',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            const artistText = this.add.text(0, 75, song.artist || 'Unknown Artist', {
                fontSize: '12px',
                fontFamily: 'Arial',
                fill: '#94a3b8',
                align: 'center'
            }).setOrigin(0.5);

            cardContainer.add([bgGlow, thumbnail, titleText, artistText]);

            cardContainer.setSize(cardWidth, cardHeight);
            cardContainer.setInteractive({ useHandCursor: true });

            cardContainer.on('pointerover', () => {
                bgGlow.clear();
                bgGlow.fillStyle(0x1e293b, 0.95);
                bgGlow.lineStyle(3, 0x00ffff, 1);
                bgGlow.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
                bgGlow.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);

                this.tweens.add({
                    targets: cardContainer,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 150,
                    ease: 'Power2'
                });
            });

            cardContainer.on('pointerout', () => {
                bgGlow.clear();
                bgGlow.fillStyle(0x0f172a, 0.85);
                bgGlow.lineStyle(2, 0x334155, 1);
                bgGlow.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
                bgGlow.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);

                this.tweens.add({
                    targets: cardContainer,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 150,
                    ease: 'Power2'
                });
            });

            cardContainer.on('pointerdown', () => {
                currentSong = song;
                this.scene.start('GameScene');
            });
        });

        const totalRows = Math.ceil(songList.length / columns);
        const totalContentHeight = startY + (totalRows * (cardHeight + gapY)) - gapY + 20;
        const maxScroll = Math.max(0, totalContentHeight - viewHeight);

        let currentScrollY = 0;

        this.input.on('pointerwheel', (pointer, over, deltaX, deltaY, deltaZ) => {
            if (maxScroll <= 0) return;
            currentScrollY -= deltaY * 0.5;
            currentScrollY = Phaser.Math.Clamp(currentScrollY, -maxScroll, 0);

            this.tweens.add({
                targets: scrollContainer,
                y: viewY + currentScrollY,
                duration: 200,
                ease: 'Power2'
            });
        });
    }
}