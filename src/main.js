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



// 💡 【追加】動画時間を取得するための関数をエクスポート
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
            ytPlayer.stopVideo();
        }
        const playerElement = document.getElementById('youtube-player');
        if (playerElement) {
            playerElement.style.display = 'none'; 
        }

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.text(centerX, centerY - 100, 'Danmaku Tube', { 
            fontSize: '48px', 
            fill: '#fff'
        }).setOrigin(0.5).setPadding(10); 

        const startButton = this.add.text(centerX, centerY + 50, '👉 ゲームスタート 👈', { 
            fontSize: '32px', 
            fill: '#00ffff',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        startButton.setInteractive();
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
        // 💡 外部のYouTubeサムネイル画像をロードする設定
        this.load.crossOrigin = 'anonymous';

        // 💡 楽曲リストをループして、全曲のサムネイル画像を自動的に読み込む
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

        // ------------------------------------------
        // ⚙️ 設定画面（SETTINGS）に移動するボタン
        // ------------------------------------------
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
            this.scene.start('SettingScene'); // 設定画面シーンへ移動
        });

        // ------------------------------------------
        // 🔙 前の画面（ホーム）に戻るボタンの追加
        // ------------------------------------------
        const backButton = this.add.text(50, 40, '← BACK', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#1e293b',
            padding: { x: 15, y: 8 }
        }).setInteractive({ useHandCursor: true });

        // 枠線をつけるための簡易的なグラフィックス（お好みで）
        backButton.on('pointerover', () => backButton.setStyle({ fill: '#ffff00', backgroundColor: '#334155' }));
        backButton.on('pointerout', () => backButton.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' }));
        backButton.on('pointerdown', () => {
            this.scene.start('HomeScene');
        });

        // タイトル表示
        this.add.text(centerX, 60, 'SELECT MUSIC', {
            fontSize: '38px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff'
        }).setOrigin(0.5);

        // ------------------------------------------
        // 📏 スクロールと配置用パラメータ設定 (サイズを少し小さく変更)
        // ------------------------------------------
        const columns = 4;        // 1行に並べるカードの数
        const cardWidth = 240;    // 💡 320 から 240 に縮小
        const cardHeight = 190;   // 💡 240 から 190 に縮小
        const gapX = 25;          // カード同士の横の隙間
        const gapY = 30;          // カード同士の縦の隙間

        // スクロール可能な表示領域（マスクをかける範囲）の定義
        const viewY = 130; // スクロールエリアの上の境界（タイトルの下）
        const viewHeight = screenHeight - viewY - 40; // 下に40pxほど余白を残す

        // カード群全体が画面の左右中央にぴったり収まるように、左端の開始座標を自動計算
        const totalGridWidth = (cardWidth * columns) + (gapX * (columns - 1));
        const startX = (screenWidth - totalGridWidth) / 2 + (cardWidth / 2); 
        const startY = cardHeight / 2 + 10; // コンテナ内での最初の行のY位置

        // 💡 すべてのカードを載せる「巨大な一枚の板（メインコンテナ）」を作成
        const scrollContainer = this.add.container(0, viewY);

        // 💡 はみ出た部分を非表示にするための「マスク」を作成して適応
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect((screenWidth - totalGridWidth) / 2 - 20, viewY, totalGridWidth + 40, viewHeight);
        const mask = maskShape.createGeometryMask();
        scrollContainer.setMask(mask);

        // カードの生成ループ
        songList.forEach((song, index) => {
            const col = index % columns;             
            const row = Math.floor(index / columns); 

            const posX = startX + col * (cardWidth + gapX);
            const posY = startY + row * (cardHeight + gapY);

            // 計算した座標でカード専用のコンテナを作成し、スクロールメインコンテナに追加
            const cardContainer = this.add.container(posX, posY);
            scrollContainer.add(cardContainer);

            // ① カードの背景・枠線
            const bgGlow = this.add.graphics();
            bgGlow.fillStyle(0x1e293b, 1);
            bgGlow.lineStyle(2, 0x334155, 1);
            bgGlow.strokeRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
            bgGlow.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);

            // ② YouTubeサムネイル画像 (サイズをカード幅に合わせて縮小)
            let thumbnail;
            if (this.textures.exists(`thumb_${song.youtubeId}`)) {
                thumbnail = this.add.image(0, -20, `thumb_${song.youtubeId}`);
                thumbnail.setDisplaySize(220, 124); // 💡 カードに合わせて縮小 (16:9比率維持)
            } else {
                thumbnail = this.add.grid(0, -20, 220, 124, 20, 20, 0x000000);
            }

            // ③ 曲名テキスト
            const titleText = this.add.text(0, 55, song.title || 'Unknown Title', {
                fontSize: '15px', // 💡 少し小さく
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            // ④ アーティスト名テキスト
            const artistText = this.add.text(0, 75, song.artist || 'Unknown Artist', {
                fontSize: '12px', // 💡 少し小さく
                fontFamily: 'Arial',
                fill: '#94a3b8',
                align: 'center'
            }).setOrigin(0.5);

            cardContainer.add([bgGlow, thumbnail, titleText, artistText]);

            // クリック用の判定設定
            cardContainer.setSize(cardWidth, cardHeight);
            cardContainer.setInteractive({ useHandCursor: true });

            // ホバー演出
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

            // クリック時
            cardContainer.on('pointerdown', () => {
                this.tweens.add({
                    targets: cardContainer,
                    alpha: 0.5,
                    duration: 50,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        if (!this.scale.isFullscreen) {
                            this.scale.startFullscreen();
                            }
                        currentSong = song;
                        const playerElement = document.getElementById('youtube-player');
                        if (playerElement) {
                            playerElement.style.display = 'block';
                        }
                        if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
                            ytPlayer.loadVideoById(song.youtubeId);
                        }
                        this.scene.start('GameScene');
                    }
                });
            });
        });

        // ------------------------------------------
        // 🖱️ スクロール制御ロジックの追加
        // ------------------------------------------
        const totalRows = Math.ceil(songList.length / columns);
        const totalContentHeight = startY + (totalRows * (cardHeight + gapY)) - gapY + 20;
        
        // 最大スクロールできる限界値を計算（コンテンツが画面内に収まるならスクロールしない）
        const maxScroll = Math.max(0, totalContentHeight - viewHeight);

        let currentScrollY = 0;

        // マウスホイールでのスクロールイベント登録
        this.input.on('pointerwheel', (pointer, over, deltaX, deltaY, deltaZ) => {
            if (maxScroll <= 0) return; // スクロール不要なら何もしない

            // ホイールの回転方向に応じてスクロール量を計算
            currentScrollY -= deltaY * 0.5;
            // 範囲制限 (0 から -maxScroll の間)
            currentScrollY = Phaser.Math.Clamp(currentScrollY, -maxScroll, 0);

            // コンテナのY座標をスムーズに動かす
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
// ⚙️ 2.5. 設定画面（セッティング）のシーン
// ==========================================
class SettingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingScene' });
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const centerX = screenWidth / 2;

        // 🔙 戻るボタン（選曲画面に戻る）
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
            this.scene.start('SelectScene'); // 選曲画面に戻る
        });

        // タイトル
        this.add.text(centerX, 80, 'SETTINGS', {
            fontSize: '38px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff'
        }).setOrigin(0.5);

        this.add.text(centerX, 150, '操作方法を選択してください', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // ⌨️ キーボード操作選択ボタン
        const keyboardBtn = this.add.text(centerX, 260, '⌨️ キーボード操作 (WASD移動)', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: operationMode === 'keyboard' ? '#00ffff' : '#ffffff',
            backgroundColor: operationMode === 'keyboard' ? '#1e293b' : '#334155',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // 🖱️ マウス操作選択ボタン
        const mouseBtn = this.add.text(centerX, 380, '🖱️ マウス操作 (カーソル追従)', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: operationMode === 'mouse' ? '#00ffff' : '#ffffff',
            backgroundColor: operationMode === 'mouse' ? '#1e293b' : '#334155',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // ボタンのクリックイベント（モード切り替え）
        keyboardBtn.on('pointerdown', () => {
            operationMode = 'keyboard'; // グローバル変数を書き換える
            keyboardBtn.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' });
            mouseBtn.setStyle({ fill: '#ffffff', backgroundColor: '#334155' });
        });

        mouseBtn.on('pointerdown', () => {
            operationMode = 'mouse'; // グローバル変数を書き換える
            keyboardBtn.setStyle({ fill: '#ffffff', backgroundColor: '#334155' });
            mouseBtn.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' });
        });
    }
}

// ==========================================
// 🎮 3. ゲーム本編のシーン
// ==========================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        playerHp = maxHp;
        isGameOver = false;
        hitCount = 0;

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

      if (window.YT && window.YT.Player && currentSong) {
            const onPlayerStateChange = (event) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                    // 💡 【字幕絶対殺す対策】動画が再生された瞬間に、YouTubeの字幕モジュールを強制解除する
                    try {
                        if (ytPlayer && typeof ytPlayer.unloadModule === 'function') {
                            ytPlayer.unloadModule('captions');
                            ytPlayer.unloadModule('cc');
                        }
                    } catch (e) {
                        console.log("字幕解除エラー(無視してOK):", e);
                    }

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

            // 💡 loadVideoById で曲を切り替えるときも、字幕オフのオプションを強制適用する
            if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
                ytPlayer.addEventListener('onStateChange', onPlayerStateChange);
                ytPlayer.loadVideoById({
                    videoId: currentSong.youtubeId,
                    playerVars: {
                        'autoplay': 1,
                        'controls': 0,
                        'disablekb': 1,
                        'rel': 0,
                        'modestbranding': 1,
                        'cc_load_policy': 0, // 字幕オフ
                        'iv_load_policy': 3  // ポップアップオフ
                    }
                });
            } else {
                // 初めてプレイヤーを作る時も完璧に設定を適用
                window.ytPlayer = new window.YT.Player('youtube-player', {
                    videoId: currentSong.youtubeId,
                    playerVars: {
                        'autoplay': 1,
                        'controls': 0,
                        'disablekb': 1,
                        'rel': 0,
                        'modestbranding': 1,
                        'cc_load_policy': 0, // 字幕オフ
                        'iv_load_policy': 3  // ポップアップオフ
                    },
                    events: {
                        'onStateChange': onPlayerStateChange
                    }
                });
                ytPlayer = window.ytPlayer;
            }
        }
        // 📱 スマホの画面回転（縦横切替）やウィンドウリサイズ時に自動追従する処理
        this.scale.on('resize', (gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height;

            // カメラの表示範囲を更新
            this.cameras.main.setViewport(0, 0, width, height);
            
            // HPバーなどのUIを新しい画面サイズに描画し直す
            this.drawHpBar();
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
            ytPlayer.stopVideo();
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

        homeButton.setInteractive();
        homeButton.on('pointerover', () => homeButton.setStyle({ fill: '#ffaa00' }));
        homeButton.on('pointerout', () => homeButton.setStyle({ fill: '#fff' }));
        homeButton.on('pointerdown', () => {
            this.scene.start('HomeScene');
        });
    }

update() {
        if (isGameOver) return;

        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const playerRadius = 10;

        // ⌨️ 操作モードが「キーボード」の場合の処理
        if (operationMode === 'keyboard') {
            if (keys.left.isDown) { player.x -= 8; } 
            else if (keys.right.isDown) { player.x += 8; }

            if (keys.up.isDown) { player.y -= 8; } 
            else if (keys.down.isDown) { player.y += 8; }
        } 
        // 🖱️ 操作モードが「マウス」の場合の処理
        else if (operationMode === 'mouse') {
            // 画面上の現在のマウス位置（ポインター）を取得
            const pointer = this.input.activePointer;

            // 自機（player）の位置をマウスの座標にぴったり追従
            player.x = pointer.x;
            player.y = pointer.y;
        }

        // 💡 左右と上下で制限の強さを変えたい場合の例
        const marginX = playerRadius + 100;  // 左右は60pxあける
        const marginY = playerRadius + 50; // 上下は50pxあけて内側に制限する

        if (player.x < marginX) { player.x = marginX; } 
        else if (player.x > screenWidth - marginX) { player.x = screenWidth - marginX; }

        if (player.y < marginY) { player.y = marginY; } 
        else if (player.y > screenHeight - marginY) { player.y = screenHeight - marginY; }

        // 💡 毎フレームボスを動画時間と同期させるためのupdate処理を実行
        if (this.currentBoss) {
            this.currentBoss.update();
        }

        // 💥 弾幕の移動と当たり判定の処理
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
// 🏆 4. 結果表示画面（リザルト画面）のシーン
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

        homeButton.setInteractive();
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
// ==========================================
// ⚙️ 5. 全体の設定（スマホ・レスポンシブ対応版）
// ==========================================
const config = {
    type: Phaser.AUTO,
    // 💡 基準となる解像度（16:9 の横長画面を基準に設定）
    width: 1280,
    height: 720,
    transparent: true, 
    parent: 'game-container',  
    scale: {
        // 💡 FIT: 画面の比率（16:9）を維持したまま、縦横どちらの画面にもピッタリ収まるように拡大縮小する
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