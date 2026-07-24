// src/main.js
import Phaser from 'phaser';
import './style.css';

import HomeScene from './scenes/home/HomeScene.js';
import SelectScene from './scenes/select/SelectScene.js';
import SettingScene from './scenes/setting/SettingScene.js';
import GameScene from './scenes/game/GameScene.js';
import ResultScene from './scenes/result/ResultScene.js';

import { setYtPlayer } from './utils/helpers.js';

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
            'showinfo': 0,
            'cc_load_policy': 0,
            'iv_load_policy': 3
        },
        events: {
            'onReady': (event) => {
                setYtPlayer(event.target);
            },
            // 🌟 再生状態が変化した時のイベント処理を追加
            'onStateChange': (event) => {
                // YT.PlayerState.PLAYING (値: 1) = 再生開始時
                if (event.data === 1 || (window.YT && event.data === window.YT.PlayerState.PLAYING)) {
                    try {
                        // 再生が始まった瞬間に字幕モジュールを物理的に解除
                        event.target.unloadModule('captions');
                        event.target.unloadModule('cc');
                    } catch (e) {
                        console.warn('Captions unload failed:', e);
                    }
                }
            }
        }
    });

    new Phaser.Game(config);
};