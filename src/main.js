import Phaser from 'phaser';
import { PatternGenerator } from './bullets/PatternGenerator.js';
import './style.css';
import { bossList } from './bosses/index.js';
import { songList } from './songs/index.js';

let player;
let keys;
let playerHp = 10000;
const maxHp = 10000;
let hpBarGraphics;
let isGameOver = false;

let hitCount = 0; 
let ytPlayer = null;
let currentSong = null; 
export let operationMode = 'mouse';
export let playerSpeed = 20; // プレイヤーの移動速度

// 💡 動画時間を取得するための関数
export function getYoutubeCurrentTimeMS() {
    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        return ytPlayer.getCurrentTime() * 1000;
    }
    return 0;
}

// ==========================================
// 🏠 1. ホーム画面のシーン
// ==========================================
class HomeScene extends Phaser.Scene {
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
        const centerX = screenWidth / 2;
        const centerY = this.cameras.main.height / 2;

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

        // タイトル
        this.add.text(centerX, centerY - 100, 'Danmaku Tube', { 
            fontSize: '48px', 
            fill: '#fff'
        }).setOrigin(0.5).setPadding(10); 

        // スタートボタン
        const startButton = this.add.text(centerX, centerY + 50, '👉 ゲームスタート 👈', { 
            fontSize: '32px', 
            fill: '#00ffff',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        startButton.setInteractive({ useHandCursor: true });
        startButton.on('pointerover', () => startButton.setStyle({ fill: '#ffff00' }));
        startButton.on('pointerout', () => startButton.setStyle({ fill: '#00ffff' }));
        startButton.on('pointerdown', () => {
            this.scene.start('SelectScene');
        });
    }
}

// ==========================================
// 🎵 2. 曲選択画面のシーン
// ==========================================
class SelectScene extends Phaser.Scene {
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
            bgGlow.fillStyle(0x1e293b, 1);
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
                bgGlow.fillStyle(0x1e293b, 1);
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
                bgGlow.fillStyle(0x1e293b, 1);
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

            // 🌟 曲カードをクリックしたら直接ゲーム画面（GameScene）へ移行
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

// ==========================================
// ⚙️ 2.5. 設定画面のシーン
// ==========================================
class SettingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingScene' });
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const centerX = screenWidth / 2;

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
            if (playerSpeed < 40) {
                playerSpeed += 1;
                speedText.setText(`${playerSpeed}`);
            }
        });
    }
}

// ==========================================
// 🎮 3. ゲーム本編のシーン（MV背景＆再生待機）
// ==========================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        playerHp = maxHp;
        isGameOver = false;
        hitCount = 0;
        this.isGameStarted = false; // ゲーム＆動画開始フラグ

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

        // 🌟 YouTube プレイヤー準備（動画ロード）
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
                'autoplay': 0, // クリックで開始するため自動再生はOFF
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

        // 🌟 画面中央に「再生＆スタート」オーバーレイを表示
        this.createStartOverlay(centerX, centerY);

        this.scale.on('resize', (gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height;
            this.cameras.main.setViewport(0, 0, width, height);
            this.drawHpBar();
        });
    }

    // 🌟 動画再生＆スタートボタンの作成
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

        // 💡 ユーザーの直接クリックイベント内で playVideo() を呼ぶことでPCの規制を突破！
        startBtn.on('pointerdown', () => {
            try {
                if (!this.scale.isFullscreen) {
                    this.scale.startFullscreen();
                }
            } catch (e) {}

            // YouTube動画再生処理
            if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
                ytPlayer.playVideo();
            }

            // オーバーレイの削除とゲーム開始
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
        // 再生ボタンを押すまでは更新処理をストップ
        if (!this.isGameStarted || isGameOver) return;

        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const playerRadius = 10;

        // キーボード操作
        if (operationMode === 'keyboard') {
            if (keys.left.isDown) { player.x -= playerSpeed; } 
            else if (keys.right.isDown) { player.x += playerSpeed; }

            if (keys.up.isDown) { player.y -= playerSpeed; } 
            else if (keys.down.isDown) { player.y += playerSpeed; }
        } 
        // マウス / タッチ追従
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
}

// ==========================================
// 🏆 4. 結果表示画面
// ==========================================
class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

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

// ==========================================
// ⚙️ 5. 全体の設定
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    transparent: true, 
    parent: 'game-container',  
    scale: {
        mode: Phaser.Scale.FIT,           
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'game-container'
    },
    scene: [HomeScene, SelectScene, SettingScene, GameScene, ResultScene]
};

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = () => {
    const game = new Phaser.Game(config);
};