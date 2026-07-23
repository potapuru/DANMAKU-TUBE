// src/scenes/home/HomeScene.js
import Phaser from 'phaser';
import { HomeVisuals } from './HomeVisuals.js';
import { HomeUI } from './HomeUI.js';
import { ytPlayer, setPlayerHp, setIsGameOver, setHitCount, maxHp } from '../../utils/helpers.js';

export default class HomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HomeScene' });
    }

    create() {
        // 1. ゲーム状態の初期化
        setPlayerHp(maxHp);
        setIsGameOver(false);
        setHitCount(0);

        // 2. YouTubeプレイヤーの停止 & 安全な透明化処理（display:noneは使わない）
        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            try { ytPlayer.stopVideo(); } catch(e) {}
        }
        
        const playerElement = document.getElementById('youtube-player');
        if (playerElement) {
            playerElement.style.opacity = '0'; 
            playerElement.style.visibility = 'hidden'; 
            playerElement.style.pointerEvents = 'none';
        }

        const overlay = document.getElementById('youtube-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.display = 'none';
        }

        // 3. 背景・UI生成
        const visuals = new HomeVisuals(this);
        visuals.createBackground();

        const ui = new HomeUI(this);
        ui.create();
    }
}