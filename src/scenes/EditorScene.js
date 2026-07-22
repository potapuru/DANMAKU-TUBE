import Phaser from 'phaser';
import { ChartModel } from '../models/ChartModel.js';
import { BulletRegistry, BULLET_TYPES } from '../models/BulletRegistry.js';

export class EditorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EditorScene' });
    }

    init(data) {
        // 既存の譜面データがあれば読み込み、無ければデフォルトID付きで作成
        this.chart = data && data.chart ? ChartModel.fromJSON(data.chart) : new ChartModel({
            title: '新規作成譜面',
            youtubeId: 'dQw4w9WgXcQ' // デフォルトのYouTube ID
        });
        
        this.selectedEventId = null;
        this.isPlaying = false;
        this.currentTimeMs = 0;
        this.totalDurationMs = 180000; // 初期動画長 (3分 = 180,000ms)
        this.timelineZoom = 1; // タイムラインの拡大率
        this.nodeViews = new Map(); // イベントID -> Phaserオブジェクトのマップ
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // 背景
        this.add.rectangle(0, 0, screenWidth, screenHeight, 0x0f172a).setOrigin(0);

        // --- 1. ヘッダーエリア ---
        this.createHeader(screenWidth);

        // --- 2. プレビュー＆YouTube表示エリア ---
        this.createPreviewArea(screenWidth, screenHeight);

        // --- 3. パラメータ編集エリア ---
        this.createParameterPanel(screenWidth, screenHeight);

        // --- 4. タイムラインエリア ---
        this.createTimelineArea(screenWidth, screenHeight);

        // 🌟 YouTube Iframe Player の初期化/接続
        this.setupYouTubePlayer();
    }

    /**
     * 1. ヘッダーエリア
     */
    createHeader(screenWidth) {
        // 🔙 戻るボタン
        const backBtn = this.add.text(30, 18, '← BACK', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#1e293b',
            padding: { x: 12, y: 6 }
        }).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => {
            const ytElem = document.getElementById('youtube-player');
            if (ytElem) ytElem.style.display = 'none';
            this.scene.start('HomeScene');
        });

        // タイトル入力風テキスト
        this.add.text(140, 22, '🎵 譜面名:', { fontSize: '14px', fill: '#94a3b8' });
        this.add.text(210, 20, this.chart.title, {
            fontSize: '16px',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#1e293b',
            padding: { x: 8, y: 4 }
        });

        // YouTube ID変更フィールド（仮表示）
        this.add.text(420, 22, '動画ID:', { fontSize: '14px', fill: '#94a3b8' });
        const ytIdText = this.add.text(480, 20, this.chart.youtubeId, {
            fontSize: '15px',
            fontFamily: 'Monospace',
            fill: '#00ffff',
            backgroundColor: '#1e293b',
            padding: { x: 8, y: 4 }
        }).setInteractive({ useHandCursor: true });

        ytIdText.on('pointerdown', () => {
            const newId = prompt('YouTubeの動画IDを入力してください（例: dQw4w9WgXcQ）:', this.chart.youtubeId);
            if (newId) {
                this.chart.youtubeId = newId.trim();
                ytIdText.setText(this.chart.youtubeId);
                this.loadYouTubeVideo(this.chart.youtubeId);
            }
        });

        // 💾 保存ボタン
        const saveBtn = this.add.text(screenWidth - 120, 18, '💾 保存', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#16a34a',
            padding: { x: 16, y: 6 }
        }).setInteractive({ useHandCursor: true });

        saveBtn.on('pointerdown', () => {
            console.log('--- 💾 譜面JSONデータ ---');
            console.log(JSON.stringify(this.chart.toJSON(), null, 2));
            alert('譜面データをコンソールに出力しました！');
        });
    }

    /**
     * 2. プレビュー＆動画エリア
     */
    createPreviewArea(screenWidth, screenHeight) {
        this.previewX = 30;
        this.previewY = 65;
        this.previewWidth = 800;
        this.previewHeight = 450;

        // 枠線と背景
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRect(this.previewX, this.previewY, this.previewWidth, this.previewHeight);
        bg.lineStyle(2, 0x334155, 1);
        bg.strokeRect(this.previewX, this.previewY, this.previewWidth, this.previewHeight);

        // プレビュー画面中央ガイド線
        const guide = this.add.graphics();
        guide.lineStyle(1, 0x1e293b, 0.8);
        guide.lineBetween(this.previewX + this.previewWidth / 2, this.previewY, this.previewX + this.previewWidth / 2, this.previewY + this.previewHeight);
        guide.lineBetween(this.previewX, this.previewY + this.previewHeight / 2, this.previewX + this.previewWidth, this.previewY + this.previewHeight / 2);
    }

    /**
     * 3. パラメータ編集エリア
     */
    createParameterPanel(screenWidth, screenHeight) {
        const panelX = 850;
        const panelY = 65;
        const panelWidth = screenWidth - panelX - 30;
        const panelHeight = 450;

        const bg = this.add.graphics();
        bg.fillStyle(0x1e293b, 0.95);
        bg.fillRect(panelX, panelY, panelWidth, panelHeight);
        bg.lineStyle(2, 0x334155, 1);
        bg.strokeRect(panelX, panelY, panelWidth, panelHeight);

        this.add.text(panelX + 20, panelY + 15, '⚙️ 弾幕属性（Step 4で連動）', {
            fontSize: '18px',
            fontWeight: 'bold',
            fill: '#00ffff'
        });

        this.paramInfoText = this.add.text(panelX + 20, panelY + 60, 'タイムライン上のノードを\n選択すると詳細設定が表示されます', {
            fontSize: '14px',
            fill: '#94a3b8',
            lineSpacing: 6
        });
    }

    /**
     * 4. タイムラインエリア（🌟核心部分）
     */
    createTimelineArea(screenWidth, screenHeight) {
        this.tlX = 30;
        this.tlY = 530;
        this.tlWidth = screenWidth - 60;
        this.tlHeight = 160;

        // 背景
        const bg = this.add.graphics();
        bg.fillStyle(0x020617, 0.95);
        bg.fillRect(this.tlX, this.tlY, this.tlWidth, this.tlHeight);
        bg.lineStyle(2, 0x1e293b, 1);
        bg.strokeRect(this.tlX, this.tlY, this.tlWidth, this.tlHeight);

        // --- タイムラインコントロールバー（上部） ---
        // 再生/一時停止ボタン
        this.playBtn = this.add.text(this.tlX + 15, this.tlY + 12, '▶ 再生', {
            fontSize: '14px',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#2563eb',
            padding: { x: 12, y: 6 }
        }).setInteractive({ useHandCursor: true });

        this.playBtn.on('pointerdown', () => this.togglePlay());

        // 時間表示 (ミリ秒)
        this.timeDisplay = this.add.text(this.tlX + 110, this.tlY + 16, '00:00.000 / 03:00.000', {
            fontSize: '16px',
            fontFamily: 'Monospace',
            fill: '#00ffff'
        });

        // 弾幕追加ボタン（ドロップダウン風）
        const addBtn = this.add.text(this.tlX + this.tlWidth - 140, this.tlY + 12, '➕ 弾幕を配置', {
            fontSize: '14px',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#16a34a',
            padding: { x: 12, y: 6 }
        }).setInteractive({ useHandCursor: true });

        addBtn.on('pointerdown', () => {
            // 現在の再生時間の位置に通常弾を追加
            const newEv = this.chart.addEvent(this.currentTimeMs, BULLET_TYPES.NORMAL);
            this.selectedEventId = newEv.id;
            this.renderTimelineNodes();
        });

        // --- タイムラインレーン（下部・ドラッグ＆クリック領域） ---
        this.laneX = this.tlX + 15;
        this.laneY = this.tlY + 55;
        this.laneWidth = this.tlWidth - 30;
        this.laneHeight = 90;

        const laneBg = this.add.graphics();
        laneBg.fillStyle(0x0f172a, 1);
        laneBg.fillRect(this.laneX, this.laneY, this.laneWidth, this.laneHeight);
        laneBg.lineStyle(1, 0x334155, 1);
        laneBg.strokeRect(this.laneX, this.laneY, this.laneWidth, this.laneHeight);

        // レーンクリックでシーク（指定時間にジャンプ）
        const laneZone = this.add.zone(this.laneX, this.laneY, this.laneWidth, this.laneHeight).setOrigin(0).setInteractive();
        laneZone.on('pointerdown', (pointer) => {
            const clickX = pointer.x - this.laneX;
            const targetRatio = Phaser.Math.Clamp(clickX / this.laneWidth, 0, 1);
            this.seekToMs(targetRatio * this.totalDurationMs);
        });

        // 赤い再生ヘッド（シークカーソル）
        this.playhead = this.add.graphics();
        this.updatePlayhead();

        // ノード用のコンテナ
        this.nodeContainer = this.add.container(0, 0);

        // 初回のノード描画
        this.renderTimelineNodes();
    }

    /**
     * タイムライン上の弾幕ノードを再描画＆D&D（ドラッグ＆ドロップ）登録
     */
    renderTimelineNodes() {
        // 既存の表示用ノードをクリア
        this.nodeContainer.removeAll(true);
        this.nodeViews.clear();

        this.chart.attackPattern.forEach(event => {
            const ratio = event.time / this.totalDurationMs;
            const nodeX = this.laneX + (ratio * this.laneWidth);
            const nodeY = this.laneY + 45;

            const isSelected = (event.id === this.selectedEventId);

            // ノードの見た目（ひし形アイコン）
            const nodeContainer = this.add.container(nodeX, nodeY);
            
            const shape = this.add.polygon(0, 0, [0, -12, 12, 0, 0, 12, -12, 0], isSelected ? 0x00ffff : 0xff00ff, 1);
            shape.setStrokeStyle(2, isSelected ? 0xffffff : 0x000000);

            const label = this.add.text(0, 18, `${(event.time / 1000).toFixed(1)}s`, {
                fontSize: '11px',
                fontFamily: 'Monospace',
                fill: isSelected ? '#00ffff' : '#94a3b8'
            }).setOrigin(0.5);

            nodeContainer.add([shape, label]);
            
            // 🌟 ドラッグ可能に設定
            nodeContainer.setSize(24, 24);
            nodeContainer.setInteractive({ useHandCursor: true, draggable: true });

            // クリック選択
            nodeContainer.on('pointerdown', (pointer) => {
                this.selectedEventId = event.id;
                this.renderTimelineNodes();
                this.updateParamPanelText(event);
            });

            // ドラッグ中の動作
            nodeContainer.on('drag', (pointer, dragX, dragY) => {
                const clampedX = Phaser.Math.Clamp(dragX, this.laneX, this.laneX + this.laneWidth);
                nodeContainer.x = clampedX;

                // 位置からミリ秒時間を逆算して更新
                const newRatio = (clampedX - this.laneX) / this.laneWidth;
                const newTimeMs = Math.round(newRatio * this.totalDurationMs);
                
                this.chart.updateEvent(event.id, { time: newTimeMs });
                label.setText(`${(newTimeMs / 1000).toFixed(1)}s`);
            });

            // ドラッグ終了時
            nodeContainer.on('dragend', () => {
                this.renderTimelineNodes();
            });

            this.nodeContainer.add(nodeContainer);
            this.nodeViews.set(event.id, nodeContainer);
        });
    }

    /**
     * 赤い再生ヘッドの位置を更新
     */
    updatePlayhead() {
        this.playhead.clear();
        const ratio = this.currentTimeMs / this.totalDurationMs;
        const x = this.laneX + (ratio * this.laneWidth);

        this.playhead.lineStyle(2, 0xff0000, 1);
        this.playhead.lineBetween(x, this.laneY, x, this.laneY + this.laneHeight);

        this.playhead.fillStyle(0xff0000, 1);
        this.playhead.fillTriangle(x - 6, this.laneY, x + 6, this.laneY, x, this.laneY + 8);
    }

    /**
     * 時間表示（ms -> MM:SS.mmm）
     */
    formatTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const sec = (totalSec % 60).toString().padStart(2, '0');
        const milli = Math.floor(ms % 1000).toString().padStart(3, '0');
        return `${min}:${sec}.${milli}`;
    }

    /**
     * YouTubeプレイヤーのセットアップ
     */
    setupYouTubePlayer() {
        const playerElem = document.getElementById('youtube-player');
        if (playerElem) {
            playerElem.style.display = 'block';
            playerElem.style.position = 'absolute';
            playerElem.style.left = `${this.previewX}px`;
            playerElem.style.top = `${this.previewY}px`;
            playerElem.style.width = `${this.previewWidth}px`;
            playerElem.style.height = `${this.previewHeight}px`;
            playerElem.style.zIndex = '10';
        }

        if (window.ytPlayer && typeof window.ytPlayer.loadVideoById === 'function') {
            this.loadYouTubeVideo(this.chart.youtubeId);
        }
    }

    loadYouTubeVideo(youtubeId) {
        if (window.ytPlayer && typeof window.ytPlayer.loadVideoById === 'function') {
            window.ytPlayer.loadVideoById(youtubeId);
            setTimeout(() => {
                if (window.ytPlayer.getDuration) {
                    const dur = window.ytPlayer.getDuration();
                    if (dur > 0) this.totalDurationMs = dur * 1000;
                }
            }, 1000);
        }
    }

    togglePlay() {
        if (!window.ytPlayer || typeof window.ytPlayer.playVideo !== 'function') return;

        if (this.isPlaying) {
            window.ytPlayer.pauseVideo();
            this.isPlaying = false;
            this.playBtn.setText('▶ 再生');
        } else {
            window.ytPlayer.playVideo();
            this.isPlaying = true;
            this.playBtn.setText('⏸ 停止');
        }
    }

    seekToMs(ms) {
        this.currentTimeMs = ms;
        if (window.ytPlayer && typeof window.ytPlayer.seekTo === 'function') {
            window.ytPlayer.seekTo(ms / 1000, true);
        }
        this.updatePlayhead();
    }

    updateParamPanelText(event) {
        const typeInfo = BulletRegistry.getInfo(event.type);
        this.paramInfoText.setText(
            `【選択中の弾幕】\n` +
            `ID: ${event.id}\n` +
            `種類: ${typeInfo.name}\n` +
            `発射時間: ${this.formatTime(event.time)}\n\n` +
            `※ Step 4でここで直接パラメータ（弾速・色・角度など）を操作できるようにします！`
        );
    }

    update() {
        // 動画再生中は時間を追従して同期
        if (this.isPlaying && window.ytPlayer && typeof window.ytPlayer.getCurrentTime === 'function') {
            this.currentTimeMs = window.ytPlayer.getCurrentTime() * 1000;
            
            if (window.ytPlayer.getDuration) {
                const dur = window.ytPlayer.getDuration();
                if (dur > 0) this.totalDurationMs = dur * 1000;
            }

            this.updatePlayhead();
            this.timeDisplay.setText(`${this.formatTime(this.currentTimeMs)} / ${this.formatTime(this.totalDurationMs)}`);
        }
    }
}