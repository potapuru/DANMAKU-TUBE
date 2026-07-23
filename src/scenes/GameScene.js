// src/scenes/HomeScene.js
import Phaser from 'phaser';
import { createCyberBackground } from '../utils/helpers.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // --- 🌟 黒いシート（オーバーレイ）の表示・位置合わせ設定を追加 ---
        const overlay = document.getElementById('youtube-overlay');
        if (overlay) {
            overlay.style.display = 'block';
            
            // 画面サイズに合わせてオーバーレイのサイズを更新する関数
            const updateOverlaySize = () => {
                const container = document.getElementById('game-container');
                if (container) {
                    overlay.style.left = '0px';
                    overlay.style.top = '0px';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                }
            };

            updateOverlaySize();
            // リサイズイベントにも対応
            this.scale.on('resize', updateOverlaySize);
        }
        playerHp = maxHp;
        isGameOver = false;
        hitCount = 0;
        this.isGameStarted = false;

        const playerElement = document.getElementById('youtube-player');
        if (playerElement) {
            playerElement.style.display = 'block'; 
        }

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        player = this.add.circle(centerX, centerY + 100, 10, 0xff0000);

        keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.bullets = [];
        
        if (currentSong && currentSong.bossClass) {
          const SelectedBoss = currentSong.bossClass;
          this.currentBoss = new SelectedBoss(this);
        } else {
          this.currentBoss = new Boss1(this);
        }

        hpBarGraphics = this.add.graphics();
        this.drawHpBar();

        if (currentSong) {
            const currentOrigin = window.location.origin || (window.location.protocol + '//' + window.location.host);

            const onPlayerStateChange = (event) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                    try {
                        if (ytPlayer && typeof ytPlayer.unloadModule === 'function') {
                            ytPlayer.unloadModule('captions');
                            ytPlayer.unloadModule('cc');
                        }
                    } catch (e) {}

                    if (this.currentBoss && typeof this.currentBoss.startAttack === 'function') {
                        this.currentBoss.startAttack();
                    }
                }
                
                if (event.data === window.YT.PlayerState.ENDED) {
                    if (!isGameOver) {
                        this.scene.start('ResultScene');
                    }
                }
            };

            const playerVarsConfig = {
                'autoplay': 0,
                'controls': 0,
                'disablekb': 1,
                'rel': 0,
                'modestbranding': 1,
                'cc_load_policy': 0,
                'iv_load_policy': 3,
                'enablejsapi': 1,
                'origin': currentOrigin
            };

            if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
                ytPlayer.loadVideoById({
                    videoId: currentSong.youtubeId,
                    playerVars: playerVarsConfig
                });
            } else if (window.YT && window.YT.Player) {
                window.ytPlayer = new window.YT.Player('youtube-player', {
                    videoId: currentSong.youtubeId,
                    host: 'https://www.youtube-nocookie.com',
                    playerVars: playerVarsConfig,
                    events: {
                        'onStateChange': onPlayerStateChange
                    }
                });
                ytPlayer = window.ytPlayer;
            }
        }

        this.createStartOverlay(centerX, centerY);

        this.scale.on('resize', (gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height;
            this.cameras.main.setViewport(0, 0, width, height);
            this.drawHpBar();
        });
    }

    createStartOverlay(centerX, centerY) {
        const overlayBg = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.65);
        
        const titleText = this.add.text(centerX, centerY - 60, `🎵 ${currentSong ? currentSong.title : 'Ready'}`, {
            fontSize: '28px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const startBtn = this.add.text(centerX, centerY + 20, '▶ 画面を押して再生＆スタート', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#1e293b',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerover', () => startBtn.setStyle({ fill: '#ffff00', backgroundColor: '#334155' }));
        startBtn.on('pointerout', () => startBtn.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' }));

        startBtn.on('pointerdown', () => {
            try {
                if (!this.scale.isFullscreen) {
                    this.scale.startFullscreen();
                }
            } catch (e) {}

            if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
                ytPlayer.playVideo();
            }

            overlayBg.destroy();
            titleText.destroy();
            startBtn.destroy();
            this.isGameStarted = true;
        });
    }

    drawHpBar() {
        hpBarGraphics.clear();
        const barWidth = 400;
        const barHeight = 20;
        const x = (this.cameras.main.width - barWidth) / 2;
        const y = this.cameras.main.height - 50;

        hpBarGraphics.fillStyle(0xff0000, 0.7);
        hpBarGraphics.fillRect(x, y, barWidth, barHeight);

        const currentBarWidth = (playerHp / maxHp) * barWidth;
        if (currentBarWidth > 0) {
            hpBarGraphics.fillStyle(0x00ff00, 0.8);
            hpBarGraphics.fillRect(x, y, currentBarWidth, barHeight);
        }
    }

    triggerGameOver() {
        isGameOver = true;
        this.tweens.killAll(); 

        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            try { ytPlayer.stopVideo(); } catch(e) {}
        }

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.text(centerX, centerY - 50, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            fontWeight: 'bold'
        }).setOrigin(0.5).setPadding(10);

        const homeButton = this.add.text(centerX, centerY + 50, 'ホーム画面に戻る', {
            fontSize: '28px',
            fill: '#fff',
            backgroundColor: '#555',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        homeButton.setInteractive({ useHandCursor: true });
        homeButton.on('pointerover', () => homeButton.setStyle({ fill: '#ffaa00' }));
        homeButton.on('pointerout', () => homeButton.setStyle({ fill: '#fff' }));
        homeButton.on('pointerdown', () => {
            this.scene.start('HomeScene');
        });
    }

    update() {
        if (!this.isGameStarted || isGameOver) return;

        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const playerRadius = 10;

        if (operationMode === 'keyboard') {
            if (keys.left.isDown) { player.x -= playerSpeed; } 
            else if (keys.right.isDown) { player.x += playerSpeed; }

            if (keys.up.isDown) { player.y -= playerSpeed; } 
            else if (keys.down.isDown) { player.y += playerSpeed; }
        } 
        else if (operationMode === 'mouse') {
            const pointer = this.input.activePointer;

            if (pointer.isDown || pointer.wasTouch || pointer.active) {
                const distance = Phaser.Math.Distance.Between(player.x, player.y, pointer.x, pointer.y);

                if (distance > 5) {
                    const angle = Phaser.Math.Angle.Between(player.x, player.y, pointer.x, pointer.y);
                    const moveDistance = Math.min(distance, playerSpeed);
                    player.x += Math.cos(angle) * moveDistance;
                    player.y += Math.sin(angle) * moveDistance;
                }
            }
        }

        const marginX = playerRadius + 100;
        const marginY = playerRadius + 50;

        if (player.x < marginX) { player.x = marginX; } 
        else if (player.x > screenWidth - marginX) { player.x = screenWidth - marginX; }

        if (player.y < marginY) { player.y = marginY; } 
        else if (player.y > screenHeight - marginY) { player.y = screenHeight - marginY; }

        if (this.currentBoss) {
            this.currentBoss.update();
        }

        if (this.bullets) {
            this.bullets = this.bullets.filter(bullet => {
                if (bullet.active) {
                    bullet.update();
                    
                    let isHit = false;
                    const playerRadius = 10;

                    if (typeof bullet.checkCollision === 'function') {
                        isHit = bullet.checkCollision(player.x, player.y, playerRadius);
                    } else {
                        const distance = Phaser.Math.Distance.Between(player.x, player.y, bullet.x, bullet.y);
                        const bulletRadius = 10;
                        isHit = distance < (playerRadius + bulletRadius);
                    }

                    if (isHit) {
                        hitCount++;
                        const damageAmount = bullet.damage || 10;
                        playerHp -= damageAmount;
                        if (playerHp < 0) playerHp = 0;
                        this.drawHpBar();

                        if (typeof bullet.checkCollision !== 'function') {
                            bullet.destroy();
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            });
        }
    }
    shutdown() {
        // 🌟 ゲーム終了時に黒シートを非表示にする
        const overlay = document.getElementById('youtube-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }

        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            try {
                ytPlayer.stopVideo();
            } catch (e) {
                console.log(e);
            }
        }
        const playerElem = document.getElementById('youtube-player');
        if (playerElem) {
            playerElem.style.display = 'none';
        }
    }
}