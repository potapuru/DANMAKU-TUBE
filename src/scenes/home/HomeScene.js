import Phaser from 'phaser';
import { HomeVisuals } from './HomeVisuals.js';
import { HomeUI } from './HomeUI.js';
import { ytPlayer } from '../../utils/helpers.js';

export default class HomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HomeScene' });
    }

    create() {
        // 1. ゲーム状態の初期化
        window.playerHp = 10000;
        window.isGameOver = false;
        window.hitCount = 0; 

        // 2. YouTubeプレイヤーの停止＆非表示処理
        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            try { ytPlayer.stopVideo(); } catch(e) {}
        }
        const playerElement = document.getElementById('youtube-player');
        if (playerElement) {
            playerElement.style.display = 'none'; 
        }

        // 3. 背景・ビジュアルの生成
        const visuals = new HomeVisuals(this);
        visuals.createBackground();

        // 4. UI・ボタンの生成
        const ui = new HomeUI(this);
        ui.create();
    }
}