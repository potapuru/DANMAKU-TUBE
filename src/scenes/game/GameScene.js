import Phaser from 'phaser';
import { PatternGenerator } from '../../bullets/PatternGenerator.js';
import { bossList } from '../../bosses/index.js';
import { 
    currentSong, 
    operationMode, 
    playerSpeed, 
    ytPlayer, 
    getYoutubeCurrentTimeMS, 
    setPlayerHp, 
    setIsGameOver, 
    setHitCount, 
    playerHp, 
    maxHp, 
    isGameOver 
} from '../../utils/helpers.js';

import { GameVisuals } from './GameVisuals.js';
import { GameUI } from './GameUI.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // 1. ビジュアルとUIのセットアップ
        this.visuals = new GameVisuals(this);
        this.visuals.setupOverlay();

        this.ui = new GameUI(this);
        this.ui.createHpBar();

        // 2. ステート初期化
        setPlayerHp(maxHp);
        setIsGameOver(false);
        setHitCount(0);
        this.isGameStarted = false;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // 3. プレイヤー自機の生成
        this.player = this.add.circle(centerX, centerY + 200, 8, 0x00ffff);
        this.player.setDepth(10);

        if (operationMode === 'keyboard') {
            this.keys = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            });
        }

        // 4. 弾幕パターンジェネレーターの初期化
        const boss = bossList[0];
        if (boss && boss.patterns) {
            this.patternGenerator = new PatternGenerator(this, boss.patterns);
        }

        // 5. YouTube動画ロード & 開始クリックプロンプト
        this.setupYouTubeAndStart();
    }

    setupYouTubeAndStart() {
        if (currentSong && currentSong.youtubeId && ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
            ytPlayer.loadVideoById({
                videoId: currentSong.youtubeId,
                startSeconds: currentSong.startTime || 0
            });
            ytPlayer.pauseVideo();
        }

        this.ui.createStartPrompt(() => {
            if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
                ytPlayer.playVideo();
            }
            this.isGameStarted = true;
        });
    }

    update() {
        if (isGameOver || !this.isGameStarted) return;

        // 🕹️ プレイヤー移動操作
        if (operationMode === 'mouse') {
            const pointer = this.input.activePointer;
            this.player.x = Phaser.Math.Clamp(pointer.x, 10, this.cameras.main.width - 10);
            this.player.y = Phaser.Math.Clamp(pointer.y, 10, this.cameras.main.height - 10);
        } else if (operationMode === 'keyboard' && this.keys) {
            if (this.keys.left.isDown) this.player.x -= playerSpeed;
            if (this.keys.right.isDown) this.player.x += playerSpeed;
            if (this.keys.up.isDown) this.player.y -= playerSpeed;
            if (this.keys.down.isDown) this.player.y += playerSpeed;

            this.player.x = Phaser.Math.Clamp(this.player.x, 10, this.cameras.main.width - 10);
            this.player.y = Phaser.Math.Clamp(this.player.y, 10, this.cameras.main.height - 10);
        }

        // 💥 弾幕更新 & 動画時間同期
        const currentTime = getYoutubeCurrentTimeMS();
        if (this.patternGenerator) {
            this.patternGenerator.update(currentTime);
        }

        // 🎯 弾とプレイヤーの当たり判定
        this.checkCollisions();

        // ☠️ ゲームオーバー判定
        if (playerHp <= 0) {
            setIsGameOver(true);
            this.scene.start('ResultScene');
        }
    }

    checkCollisions() {
        if (!this.patternGenerator || !this.patternGenerator.bullets) return;

        const playerRadius = 8;
        this.patternGenerator.bullets = this.patternGenerator.bullets.filter(bullet => {
            if (!bullet || !bullet.active) return false;

            let isHit = false;
            if (typeof bullet.checkCollision === 'function') {
                isHit = bullet.checkCollision(this.player);
            } else {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, bullet.x, bullet.y);
                const bulletRadius = 10;
                isHit = distance < (playerRadius + bulletRadius);
            }

            if (isHit) {
                setHitCount(prev => prev + 1);
                const damageAmount = bullet.damage || 10;
                setPlayerHp(Math.max(0, playerHp - damageAmount));
                this.ui.drawHpBar();

                if (typeof bullet.checkCollision !== 'function') {
                    bullet.destroy();
                    return false;
                }
            }
            return true;
        });
    }

    shutdown() {
        if (this.visuals) {
            this.visuals.cleanup();
        }
    }
}