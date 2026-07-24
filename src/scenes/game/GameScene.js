// src/scenes/game/GameScene.js
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
        this.visuals = new GameVisuals(this);
        this.visuals.setupOverlay();

        this.ui = new GameUI(this);
        this.ui.createHpBar();

        setPlayerHp(maxHp);
        setIsGameOver(false);
        setHitCount(0);
        this.isGameStarted = false;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.player = this.add.circle(centerX, centerY + 200, 8, 0x00ffff);
        this.player.setDepth(10);

        if (operationMode === 'keyboard' && this.input.keyboard) {
            this.keys = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            });
        }

        const boss = bossList[0];
        if (boss && boss.patterns) {
            this.patternGenerator = new PatternGenerator(this, boss.patterns);
        }

        this.setupYouTubeAndStart();
    }

    setupYouTubeAndStart() {
        // 【フリーズ対策】YouTube APIの存在・準備状態を厳格にチェック
        if (currentSong && currentSong.youtubeId) {
            if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
                try {
                    ytPlayer.loadVideoById({
                        videoId: currentSong.youtubeId,
                        startSeconds: currentSong.startTime || 0
                    });
                    if (typeof ytPlayer.unloadModule === 'function') {
                        try {
                            ytPlayer.unloadModule('captions');
                            ytPlayer.unloadModule('cc');
                        } catch (err) {}
                    }
                    if (typeof ytPlayer.pauseVideo === 'function') {
                        ytPlayer.pauseVideo();
                    }
                } catch (e) {
                    // YouTube側でエラーが発生してもゲームを停止（フリーズ）させない
                    console.warn('YouTube Player load error (Proceeding anyway):', e);
                }
            } else {
                console.warn('ytPlayer is not ready or not initialized.');
            }
        }

        // スタートUIの表示（画面タップ/スペースキーで開始）
        this.ui.createStartPrompt(() => {
            if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
                try {
                    ytPlayer.playVideo();
                } catch (e) {
                    console.warn('YouTube Play error:', e);
                }
            }
            this.isGameStarted = true;
        });
    }

    update() {
        if (isGameOver || !this.isGameStarted) return;

        if (operationMode === 'mouse') {
            const pointer = this.input.activePointer;
            if (pointer) {
                this.player.x = Phaser.Math.Clamp(pointer.x, 10, this.cameras.main.width - 10);
                this.player.y = Phaser.Math.Clamp(pointer.y, 10, this.cameras.main.height - 10);
            }
        } else if (operationMode === 'keyboard' && this.keys) {
            if (this.keys.left && this.keys.left.isDown) this.player.x -= playerSpeed;
            if (this.keys.right && this.keys.right.isDown) this.player.x += playerSpeed;
            if (this.keys.up && this.keys.up.isDown) this.player.y -= playerSpeed;
            if (this.keys.down && this.keys.down.isDown) this.player.y += playerSpeed;

            this.player.x = Phaser.Math.Clamp(this.player.x, 10, this.cameras.main.width - 10);
            this.player.y = Phaser.Math.Clamp(this.player.y, 10, this.cameras.main.height - 10);
        }

        const currentTime = getYoutubeCurrentTimeMS();
        if (this.patternGenerator) {
            this.patternGenerator.update(currentTime);
        }

        this.checkCollisions();

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