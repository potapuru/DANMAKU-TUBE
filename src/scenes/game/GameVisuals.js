import { ytPlayer } from '../../utils/helpers.js';

export class GameVisuals {
    constructor(scene) {
        this.scene = scene;
    }

    // 🌟 黒い透過シート（YouTube上のオーバーレイ）の配置と調整
    setupOverlay() {
        const overlay = document.getElementById('youtube-overlay');
        if (overlay) {
            overlay.style.display = 'block';
            
            const updateOverlaySize = () => {
                const container = document.getElementById('game-container');
                if (container) {
                    overlay.style.left = '0px';
                    overlay.style.top = '0px';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                }
            };

            updateOverlaySize();
            this.scene.scale.on('resize', updateOverlaySize);
        }

        const playerElement = document.getElementById('youtube-player');
        if (playerElement) {
            playerElement.style.display = 'block'; 
        }
    }

    // 🧹 ゲーム終了時のクリーンアップ処理（オーバーレイや動画の非表示）
    cleanup() {
        const overlay = document.getElementById('youtube-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }

        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            try {
                ytPlayer.stopVideo();
            } catch (e) {
                console.log(e);
            }
        }
        const playerElem = document.getElementById('youtube-player');
        if (playerElem) {
            playerElem.style.display = 'none';
        }
    }
}