import { BossBase } from './BossBase.js';
import { PatternGenerator } from '../bullets/PatternGenerator.js';

export class Boss1 extends BossBase { // 💡 BossBaseの能力を引き継ぐ
    constructor(scene) {
        // 💡 親クラス（BossBase）のconstructorを呼び出す（色は紫にする）
        super(scene, 0x8800ff);

        // 🎼 ボス1専用の「弾幕の楽譜」（カッコ ( ) で囲んで関数を呼び出す形に修正）
        this.setPattern([
            
        ]);
    }
}