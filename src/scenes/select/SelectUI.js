// src/scenes/select/SelectUI.js
import Phaser from 'phaser';
import { songList } from '../../songs/index.js';
import { setCurrentSong } from '../../utils/helpers.js';

export class SelectUI {
    constructor(scene) {
        this.scene = scene;
    }

    create() {
        this.isSelecting = false;

        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const centerX = screenWidth / 2;

        this.createBackButton();
        this.createTitle(centerX);
        this.createSongList(screenWidth, screenHeight);
    }

    createBackButton() {
        const backButton = this.scene.add.text(50, 40, '← BACK', {
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
            this.scene.scene.start('HomeScene');
        });
    }

    createTitle(centerX) {
        this.scene.add.text(centerX, 50, 'SELECT MUSIC', {
            fontSize: '36px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            stroke: '#ff00ff',
            strokeThickness: 3
        }).setOrigin(0.5);
    }

    createSongList(screenWidth, screenHeight) {
        const scrollContainer = this.scene.add.container(0, 0);

        const cardWidth = 320;
        const cardHeight = 120;
        const columns = 3;
        const startY = 120;
        const gapX = 30;
        const gapY = 25;

        const totalWidth = (columns * cardWidth) + ((columns - 1) * gapX);
        const startX = (screenWidth - totalWidth) / 2 + (cardWidth / 2);
        const viewHeight = screenHeight - startY - 20;

        songList.forEach((song, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);

            const x = startX + col * (cardWidth + gapX);
            const y = startY + row * (cardHeight + gapY) + (cardHeight / 2);

            const cardContainer = this.scene.add.container(x, y);
            scrollContainer.add(cardContainer);

            const bgGlow = this.scene.add.graphics();
            bgGlow.fillStyle(0x0f172a, 0.85);
            bgGlow.lineStyle(2, 0x334155, 1);
            bgGlow.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
            bgGlow.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
            cardContainer.add(bgGlow);

            if (song.youtubeId) {
                const thumbKey = `thumb_${song.youtubeId}`;
                if (this.scene.textures.exists(thumbKey)) {
                    const thumbImg = this.scene.add.image(-cardWidth / 2 + 10, 0, thumbKey).setOrigin(0, 0.5);
                    thumbImg.setDisplaySize(130, 95);
                    cardContainer.add(thumbImg);
                }
            }

            const textX = -cardWidth / 2 + 150;
            const titleText = this.scene.add.text(textX, -30, song.title, {
                fontSize: '18px',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#ffffff',
                wordWrap: { width: cardWidth - 160 }
            });

            const artistText = this.scene.add.text(textX, 5, song.artist || 'Unknown', {
                fontSize: '14px',
                fill: '#94a3b8'
            });

            const diffText = this.scene.add.text(textX, 30, `BPM: ${song.bpm || '---'}`, {
                fontSize: '13px',
                fill: '#00ffff'
            });

            cardContainer.add([titleText, artistText, diffText]);

            const hitArea = new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
            cardContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

            cardContainer.on('pointerover', () => {
                bgGlow.clear();
                bgGlow.fillStyle(0x1e293b, 0.95);
                bgGlow.lineStyle(2, 0x00ffff, 1);
                bgGlow.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
                bgGlow.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
            });

            cardContainer.on('pointerout', () => {
                bgGlow.clear();
                bgGlow.fillStyle(0x0f172a, 0.85);
                bgGlow.lineStyle(2, 0x334155, 1);
                bgGlow.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
                bgGlow.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
            });

            // 🌟 クリック時の遷移エラーを修正
            cardContainer.on('pointerdown', () => {
                if (this.isSelecting) return;
                this.isSelecting = true;

                setCurrentSong(song);

                // this.scene.scene.start ではなく this.scene.scene.start を呼んでいた箇所を安全な記述に修正
                this.scene.scene.start('GameScene');
            });
        });

        const totalRows = Math.ceil(songList.length / columns);
        const totalContentHeight = startY + (totalRows * (cardHeight + gapY)) - gapY + 20;
        const maxScroll = Math.max(0, totalContentHeight - viewHeight);

        let currentScrollY = 0;

        this.scene.input.on('pointerwheel', (pointer, over, deltaX, deltaY, deltaZ) => {
            if (maxScroll <= 0) return;
            currentScrollY -= deltaY * 0.5;
            currentScrollY = Phaser.Math.Clamp(currentScrollY, -maxScroll, 0);
            scrollContainer.y = currentScrollY;
        });
    }
}