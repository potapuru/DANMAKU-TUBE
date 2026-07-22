import Phaser from 'phaser';
import { ChartModel } from '../models/ChartModel.js';
import { BulletRegistry, BULLET_TYPES } from '../models/BulletRegistry.js';

export class EditorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EditorScene' });
    }

    init(data) {
        // 既存の譜面データがあれば読み込み、無ければ新規作成
        this.chart = data && data.chart ? ChartModel.fromJSON(data.chart) : new ChartModel();
        this.selectedEventId = null; // 現在選択中の弾幕イベントID
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // 背景
        this.add.rectangle(0, 0, screenWidth, screenHeight, 0x0f172a).setOrigin(0);

        // --- 1. ヘッダーエリア ---
        this.createHeader(screenWidth);

        // --- 2. プレビュー＆操作エリア（中央〜左） ---
        this.createPreviewArea(screenWidth, screenHeight);

        // --- 3. パラメータ編集エリア（右側） ---
        this.createParameterPanel(screenWidth, screenHeight);

        // --- 4. タイムラインエリア（下部） ---
        this.createTimelineArea(screenWidth, screenHeight);
    }

    /**
     * ヘッダー（戻るボタン・タイトル・保存ボタン）
     */
    createHeader(screenWidth) {
        // 🔙 戻るボタン
        const backBtn = this.add.text(30, 20, '← BACK', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#1e293b',
            padding: { x: 12, y: 6 }
        }).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => {
            this.scene.start('HomeScene');
        });

        // 画面タイトル
        this.add.text(screenWidth / 2, 25, 'DANMAKU MAKER (譜面作成)', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5, 0);

        // 💾 保存ボタン
        const saveBtn = this.add.text(screenWidth - 120, 20, '💾 保存', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#16a34a',
            padding: { x: 15, y: 6 }
        }).setInteractive({ useHandCursor: true });

        saveBtn.on('pointerdown', () => {
            console.log('保存された譜面JSON:', JSON.stringify(this.chart.toJSON(), null, 2));
            alert('譜面データをコンソールに出力しました！（後ほどローカル保存を実装します）');
        });
    }

    /**
     * プレビューエリアの枠組み
     */
    createPreviewArea(screenWidth, screenHeight) {
        const previewWidth = 800;
        const previewHeight = 450;
        const x = 30;
        const y = 70;

        // 枠線と背景
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRect(x, y, previewWidth, previewHeight);
        bg.lineStyle(2, 0x334155, 1);
        bg.strokeRect(x, y, previewWidth, previewHeight);

        // 仮のプレビュー用テキスト
        this.add.text(x + previewWidth / 2, y + previewHeight / 2, '📺 YouTube ＆ 弾幕プレビュー枠', {
            fontSize: '20px',
            fill: '#64748b'
        }).setOrigin(0.5);
    }

    /**
     * 右側：パラメータ変更パネル（仮表示）
     */
    createParameterPanel(screenWidth, screenHeight) {
        const panelX = 850;
        const panelY = 70;
        const panelWidth = screenWidth - panelX - 30;
        const panelHeight = 450;

        const bg = this.add.graphics();
        bg.fillStyle(0x1e293b, 0.9);
        bg.fillRect(panelX, panelY, panelWidth, panelHeight);
        bg.lineStyle(2, 0x334155, 1);
        bg.strokeRect(panelX, panelY, panelWidth, panelHeight);

        this.add.text(panelX + 20, panelY + 20, '⚙️ 弾幕パラメータ', {
            fontSize: '20px',
            fontWeight: 'bold',
            fill: '#00ffff'
        });

        this.add.text(panelX + 20, panelY + 70, '※ ここに選択中の弾幕の\nスライダーや色設定が表示されます', {
            fontSize: '14px',
            fill: '#94a3b8',
            lineSpacing: 8
        });
    }

    /**
     * 下部：タイムライン表示エリア（仮表示）
     */
    createTimelineArea(screenWidth, screenHeight) {
        const timelineX = 30;
        const timelineY = 540;
        const timelineWidth = screenWidth - 60;
        const timelineHeight = 150;

        const bg = this.add.graphics();
        bg.fillStyle(0x0f172a, 0.95);
        bg.fillRect(timelineX, timelineY, timelineWidth, timelineHeight);
        bg.lineStyle(2, 0x00ffff, 1);
        bg.strokeRect(timelineX, timelineY, timelineWidth, timelineHeight);

        this.add.text(timelineX + 20, timelineY + 15, '🎬 タイムライン (動画再生・弾幕配置)', {
            fontSize: '16px',
            fontWeight: 'bold',
            fill: '#00ffff'
        });

        // 弾幕追加テストボタン
        const addBtn = this.add.text(timelineX + timelineWidth - 160, timelineY + 10, '➕ 弾幕を追加', {
            fontSize: '14px',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#2563eb',
            padding: { x: 10, y: 5 }
        }).setInteractive({ useHandCursor: true });

        addBtn.on('pointerdown', () => {
            const newEv = this.chart.addEvent(1000, BULLET_TYPES.NORMAL);
            alert(`弾幕イベントを追加しました！ (ID: ${newEv.id})`);
        });
    }
}