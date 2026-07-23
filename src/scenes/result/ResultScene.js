import Phaser from 'phaser';
import { ResultVisuals } from './ResultVisuals.js';
import { ResultUI } from './ResultUI.js';

export default class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    create() {
        // 1. 背景演出の生成
        const visuals = new ResultVisuals(this);
        visuals.createBackground();

        // 2. 結果UI（スコア・テキスト・ボタン）の生成
        const ui = new ResultUI(this);
        ui.create();
    }
}