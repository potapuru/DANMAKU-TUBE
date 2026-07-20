import { BossBase } from './BossBase.js'; // 💡 共通のベースを読み込む
import { PatternGenerator } from '../bullets/PatternGenerator.js';
import { RIGHT } from 'phaser';

export class Boss5 extends BossBase { // 💡 BossBaseの能力を引き継ぐ
    constructor(scene) {
        // 💡 親クラス（BossBase）のconstructorを呼び出す（色は紫にする）
        super(scene, 0x8800ff);

        this.setPattern([
        ...PatternGenerator.createCircleSpread(
            3000, window.innerWidth / 2, window.innerHeight / 2, 24, 2, Math.PI / 1),
        ...PatternGenerator.createCircleSpread(
            3300, window.innerWidth / 2, window.innerHeight / 2, 24, 2, Math.PI / 7.5),
        ...PatternGenerator.createCircleSpread(
            3600, window.innerWidth / 2, window.innerHeight / 2, 24, 2, Math.PI / 1),
        ...PatternGenerator.createCircleSpread(
            3900, window.innerWidth / 2, window.innerHeight / 2, 24, 2, Math.PI / 7.5),
        ...PatternGenerator.createCircleSpread(
            4200, window.innerWidth / 2, window.innerHeight / 2, 24, 2, Math.PI / 1),
        ...PatternGenerator.createSpiralSpread(
            5000, window.innerWidth / 2, 0, 200, 200, 0.2, 1, 0),
        ...PatternGenerator.createSpiralSpread(
            5000, window.innerWidth / 2, 0, 200, 200, 0.2, 1, Math.PI),
        ...PatternGenerator.createSpiralSpread(
            5000, window.innerWidth / 2, 0, 200, 200, 0.2, 1, Math.PI / 2),
        ...PatternGenerator.createSpiralSpread(
            5000, window.innerWidth / 2, 0, 200, 200, 0.2, 1, Math.PI * 3 / 2),
        ...PatternGenerator.createSpiralSpread(
            5000, window.innerWidth / 2, 0, 200, 200, -0.2, 1, 0),
        ...PatternGenerator.createSpiralSpread(
            5000, window.innerWidth / 2, 0, 200, 200, -0.2, 1, Math.PI),
        ...PatternGenerator.createSpiralSpread(
            5000, window.innerWidth / 2, 0, 200, 200, -0.2, 1, Math.PI / 2),
        ...PatternGenerator.createSpiralSpread(
            5000, window.innerWidth / 2, 0, 200, 200, -0.2, 1, Math.PI * 3 / 2),

        ]);
    }
}