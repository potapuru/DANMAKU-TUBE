import { BossBase } from './BossBase.js';
import { PatternGenerator } from '../bullets/PatternGenerator.js';

export class Boss2 extends BossBase {
    constructor(scene) {
        const centerX = scene.cameras.main.width / 2;
        const centerY = scene.cameras.main.height / 2;
        // 親クラス（BossBase）のconstructorを呼び出す（試しに赤っぽい色に設定）
        super(scene, 0xff3300); 

        // 💡 ツールを初期化する
        const gen = new PatternGenerator(scene, this.attackPattern);

        // ========================================================
        // 🎼 ボス2専用の楽譜（関数呼び出し）
        // ========================================================
        this.setPattern([
            { at: 1000, type: 'down', pos: 200 },
            { at: 2000, type: 'wave_down', pos: 400 },
            { at: 3000, type: 'down', pos: 600 },
            { at: 5000, type: 'homing', pos: 300 },
            { at: 7000, type: 'laser_v', pos: 400 },
            { at: 9000, type: 'left', pos: 200 },
            { at: 11000, type: 'right', pos: 500 },
        ]);
        // ループ処理
       /* const basePatternCopy = [...this.attackPattern];
        const loopCount = 4;      
        const loopDuration = 10000;

        for (let i = 1; i < loopCount; i++) {
            const timeOffset = i * loopDuration; 
            basePatternCopy.forEach(data => {
                this.attackPattern.push({
                    at: data.at + timeOffset,
                    type: data.type,
                    pos: data.pos
                });
            });
        }  */
    }
}