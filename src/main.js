// src/main.js
import Phaser from 'phaser';
import './style.css';

// フォルダごとに分割したシーンのインポート
import HomeScene from './scenes/home/HomeScene.js';
import SelectScene from './scenes/select/SelectScene.js';
import SettingScene from './scenes/setting/SettingScene.js';
import GameScene from './scenes/game/GameScene.js';
import ResultScene from './scenes/result/ResultScene.js';

import { setYtPlayer } from './utils/helpers.js';

// ==========================================
// ⚙️ Phaser ゲーム設定
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    transparent: true, 
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.FIT,           
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'game-container'
    },
    scene: [HomeScene, SelectScene, SettingScene, GameScene, ResultScene]
};

// ==========================================
// 📺 YouTube Iframe API の読み込み & 起動
// ==========================================
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = () => {
    const player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: '', 
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0
        },
        events: {
            'onReady': (event) => {
                setYtPlayer(event.target);
            }
        }
    });

    // Phaser ゲームインスタンス生成
    new Phaser.Game(config);
};