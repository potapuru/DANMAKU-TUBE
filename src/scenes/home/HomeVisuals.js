import { createCyberBackground } from '../../utils/helpers.js';

export class HomeVisuals {
    constructor(scene) {
        this.scene = scene;
    }

    // 🌟 ネオンパーティクル背景を作成
    createBackground() {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        // 45個のパーティクルを生成
        createCyberBackground(this.scene, screenWidth, screenHeight, 45);
    }
}