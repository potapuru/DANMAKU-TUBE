// src/scenes/game/GameVisuals.js
import { ytPlayer } from '../../utils/helpers.js';
export class GameVisuals {
    constructor(scene) {
        this.scene = scene;
    }

    // 🌟 YouTubeプレイヤーと黒シートの表示設定
    setupOverlay() {
        const overlay = document.getElementById('youtube-overlay');
        if (overlay) {
            overlay.style.display = 'block';
            overlay.style.opacity = '1';
            
            const updateOverlaySize = () => {
                overlay.style.left = '0px';
                overlay.style.top = '0px';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
            };

            updateOverlaySize();
            this.scene.scale.on('resize', updateOverlaySize);
        }

        // 🌟 display: block ではなく opacity / visibility で安全に表示
        const playerElement = document.getElementById('youtube-player');
        if (playerElement) {
            playerElement.style.opacity = '1';
            playerElement.style.visibility = 'visible';
            playerElement.style.pointerEvents = 'auto';
        }
    }

    // 🧹 ゲーム終了時のクリーンアップ処理（プレイヤーを破壊せずに透明化する）
    cleanup() {
        const overlay = document.getElementById('youtube-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.display = 'none';
        }

        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            try {
                ytPlayer.stopVideo();
            } catch (e) {
                console.log(e);
            }
        }

        // 🌟 display: none にせず opacity: 0 で透明化（インスタンス破棄を防止）
        const playerElem = document.getElementById('youtube-player');
        if (playerElem) {
            playerElem.style.opacity = '0';
            playerElem.style.visibility = 'hidden';
            playerElem.style.pointerEvents = 'none';
        }
    }
}