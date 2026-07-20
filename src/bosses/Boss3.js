import { BossBase } from './BossBase.js'; // 💡 共通のベースを読み込む
import { PatternGenerator } from '../bullets/PatternGenerator.js';

export class Boss3 extends BossBase { // 💡 BossBaseの能力を引き継ぐ
    constructor(scene) {
        // 💡 親クラス（BossBase）のconstructorを呼び出す（色は紫にする）
        super(scene, 0x8800ff);

        this.setPattern([
        ...PatternGenerator.createFourWayStorm(0, 3000, 20),
        ...PatternGenerator.createCenterLineDown(5000, window.innerWidth / 2, 18, 'down', 100),
        ...PatternGenerator.createCenterLineDown(5500, window.innerWidth / 2 +50, 18, 'right', 100),  
        ...PatternGenerator.createCenterLineDown(6000, window.innerWidth / 2, 18, 'up', 100),
        ...PatternGenerator.createCenterLineDown(6500, window.innerWidth / 2 +50, 18, 'left', 100),
        ...PatternGenerator.createCircleSpread(10000, 400, 300, 24),
        ...PatternGenerator.createCircleSpread(15000, 0, 0, 24),
        ...PatternGenerator.createCircleSpread(15000, 800, 600, 24),
        ...PatternGenerator.createCircleSpread(15000, 0, 600, 24),
        ...PatternGenerator.createCircleSpread(15000, 800, 0, 24),


        ]);
    }
}