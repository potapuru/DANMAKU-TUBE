// src/ui/UIButton.js
import Phaser from 'phaser';

/**
 * 🔘 共通のスタイリッシュボタンを作成する関数
 * @param {Phaser.Scene} scene - 対象のシーン (this)
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @param {string} text - ボタンに表示するテキスト
 * @param {Function} onClick - クリック時の処理
 * @returns {Phaser.GameObjects.Text} 作成されたテキストオブジェクト
 */
export function createCyberButton(scene, x, y, text, onClick) {
    const button = scene.add.text(x, y, text, {
        fontSize: '20px',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#00ffff',
        backgroundColor: '#1e293b',
        padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    // ホバー時のアニメーション・色変化
    button.on('pointerover', () => {
        button.setStyle({ fill: '#ffff00', backgroundColor: '#334155' });
        scene.tweens.add({
            targets: button,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
            ease: 'Power1'
        });
    });

    // カーソルが離れた時
    button.on('pointerout', () => {
        button.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' });
        scene.tweens.add({
            targets: button,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 100,
            ease: 'Power1'
        });
    });

    // クリック時
    button.on('pointerdown', onClick);

    return button;
}

/**
 * 🔙 左上に配置する「戻る（BACK）」ボタン
 */
export function createBackButton(scene, onClick) {
    const backBtn = scene.add.text(50, 40, '← BACK', {
        fontSize: '20px',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#00ffff',
        backgroundColor: '#1e293b',
        padding: { x: 15, y: 8 }
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ffff00', backgroundColor: '#334155' }));
    backBtn.on('pointerout', () => backBtn.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' }));
    backBtn.on('pointerdown', onClick);

    return backBtn;
}