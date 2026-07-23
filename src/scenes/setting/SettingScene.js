import Phaser from 'phaser';
import { SettingVisuals } from './SettingVisuals.js';
import { SettingUI } from './SettingUI.js';

export default class SettingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingScene' });
    }

    create() {
        // 1. 背景演出の生成
        const visuals = new SettingVisuals(this);
        visuals.createBackground();

        // 2. 設定画面UI（ボタン類）の生成
        const ui = new SettingUI(this);
        ui.create();
    }
}