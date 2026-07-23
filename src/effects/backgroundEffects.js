// src/effects/backgroundEffects.js
import Phaser from 'phaser';

/**
 * 🌟 1. ネオン系サイバー粒子エフェクト
 * @param {Phaser.Scene} scene - 対象のシーン
 * @param {number} width - 画面幅
 * @param {number} height - 画面高さ
 * @param {number} count - パーティクルの個数
 */
export function createCyberBackground(scene, width, height, count = 70) {
    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x3b82f6];

    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(0, height);
        const size = Phaser.Math.Between(3, 8);
        const color = Phaser.Utils.Array.GetRandom(colors);
        const alpha = Phaser.Math.FloatBetween(0.2, 0.7);

        const particle = scene.add.circle(x, y, size, color, alpha);

        scene.tweens.add({
            targets: particle,
            y: y - Phaser.Math.Between(150, 400),
            x: x + Phaser.Math.Between(-50, 50),
            alpha: 0,
            duration: Phaser.Math.Between(3000, 7000),
            ease: 'Sine.easeOut',
            repeat: -1,
            repeatDelay: Phaser.Math.Between(100, 1500),
            onRepeat: (tween, target) => {
                target.x = Phaser.Math.Between(0, width);
                target.y = height + 20;
                target.alpha = Phaser.Math.FloatBetween(0.2, 0.7);
            }
        });
    }
}

/**
 * 🌌 2. 星空（流れ星）エフェクト（今後の拡張例）
 */
export function createStarfieldBackground(scene, width, height, count = 100) {
    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(0, height);
        const star = scene.add.rectangle(x, y, 2, 2, 0xffffff, Phaser.Math.FloatBetween(0.3, 1.0));

        // 明滅アニメーション
        scene.tweens.add({
            targets: star,
            alpha: 0.1,
            duration: Phaser.Math.Between(500, 2000),
            yoyo: true,
            repeat: -1
        });
    }
}