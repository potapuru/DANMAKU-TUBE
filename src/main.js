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
// ⚙️ 5. 全体の設定
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    transparent: true, 
    parent: 'game-container',
    dom: {
        createContainer: true // 🌟 HTML DOM Overlay を有効化
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
    const game = new Phaser.Game(config);
};