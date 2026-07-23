import Phaser from 'phaser';
import { songList } from '../../songs/index.js';
import { SelectVisuals } from './SelectVisuals.js';
import { SelectUI } from './SelectUI.js';

export default class SelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectScene' });
    }

    // 🖼️ YouTubeサムネイル画像の事前ロード
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
        // 1. 背景演出の生成
        const visuals = new SelectVisuals(this);
        visuals.createBackground();

        // 2. UI・楽曲リスト・スクロール等の生成
        const ui = new SelectUI(this);
        ui.create();
    }
}