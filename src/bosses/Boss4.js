import { BossBase } from './BossBase.js'; // 💡 共通のベースを読み込む
import { PatternGenerator } from '../bullets/PatternGenerator.js';

export class Boss4 extends BossBase { // 💡 BossBaseの能力を引き継ぐ
    constructor(scene) {
        // 💡 親クラス（BossBase）のconstructorを呼び出す（色は紫にする）
        super(scene, 0x8800ff);

        this.setPattern([
       /* ...PatternGenerator.createCircleSpread(1000, 638, 400, 24, 2.5),
        ...PatternGenerator.createCircleSpread(5000, 0, 0, 24, 4),
        ...PatternGenerator.createCircleSpread(5000, 1275, 800, 24, 4),
        ...PatternGenerator.createCircleSpread(5000, 0, 800, 24, 4),
        ...PatternGenerator.createCircleSpread(5000, 1275, 0, 24, 4), */
        ...PatternGenerator.createSpiralSpread(1000, 638, 0, 200, 31, 0.157, 1,),
        ...PatternGenerator.createSpiralSpread(1000, 638, 0, 200, 43, 0.123, 1),
        ...PatternGenerator.createSpiralSpread(1000, 638, 0, 200, 23, -0.231, 1),
        ]);
    }
}