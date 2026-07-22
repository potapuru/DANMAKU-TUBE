import Phaser from 'phaser';
import { ChartModel } from '../models/ChartModel.js';
import { BulletRegistry, BULLET_TYPES } from '../models/BulletRegistry.js';

export class EditorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EditorScene' });
    }

    init(data) {
        this.chart = data && data.chart ? ChartModel.fromJSON(data.chart) : new ChartModel({
            title: '新規作成譜面',
            youtubeId: 'dQw4w9WgXcQ'
        });
        
        this.selectedEventId = null;
        this.isPlaying = false;
        this.currentTimeMs = 0;
        this.totalDurationMs = 180000;
        this.nodeViews = new Map();
        this.domElements = [];
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // 背景
        this.add.rectangle(0, 0, screenWidth, screenHeight, 0x0f172a).setOrigin(0);

        // --- 1. プレビュー＆YouTube表示エリア ---
        this.createPreviewArea(screenWidth, screenHeight);

        // --- 2. ヘッダーエリア（BACKボタン ＆ URL入力フォーム） ---
        this.createHeader(screenWidth);

        // --- 3. パラメータ編集エリア ---
        this.createParameterPanel(screenWidth, screenHeight);

        // --- 4. タイムラインエリア ---
        this.createTimelineArea(screenWidth, screenHeight);

        // 🌟 YouTube プレイヤーの設置
        this.setupYouTubePlayer();

        // 画面リサイズ時にもYouTubeの位置を追従させる
        this.scale.on('resize', () => this.updateYouTubePosition());
    }

    /**
     * URLからYouTube動画IDを抽出するユーティリティ関数
     */
    extractYouTubeId(urlOrId) {
        if (!urlOrId) return '';
        const trimmed = urlOrId.trim();
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = trimmed.match(regExp);
        if (match && match[2].length === 11) return match[2];
        if (trimmed.length === 11) return trimmed;
        return trimmed;
    }

    /**
     * 1. ヘッダーエリア（BACKボタンの右隣にURL入力欄を配置）
     */
    createHeader(screenWidth) {
        // 🔙 BACKボタン (x: 20, y: 15)
        const backBtn = this.add.text(20, 15, '← BACK', {
            fontSize: '15px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#1e293b',
            padding: { x: 10, y: 5 }
        }).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => {
            this.cleanupDomElements();
            const ytElem = document.getElementById('youtube-player');
            if (ytElem) ytElem.style.display = 'none';
            if (window.ytPlayer && typeof window.ytPlayer.pauseVideo === 'function') {
                window.ytPlayer.pauseVideo();
            }
            this.scene.start('HomeScene');
        });

        // 🔍 BACKボタンの右側(x: 120, y: 12)に配置するHTML入力フォーム
        const formHtml = `
            <div style="display: flex; align-items: center; gap: 8px; font-family: Arial, sans-serif; position: relative; z-index: 9999;">
                <span style="color: #94a3b8; font-size: 13px; font-weight: bold; white-space: nowrap;">🔗 URL:</span>
                <input type="text" id="editor-yt-url-input" 
                       value="https://www.youtube.com/watch?v=${this.chart.youtubeId}" 
                       placeholder="https://www.youtube.com/watch?v=..." 
                       style="width: 380px; padding: 6px 10px; background: #0f172a; color: #00ffff; border: 1px solid #334155; border-radius: 4px; font-size: 13px; outline: none;" />
                <button id="editor-yt-load-btn" 
                        style="padding: 6px 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 13px; white-space: nowrap;">
                    読み込む
                </button>
            </div>
        `;

        const formDom = this.add.dom(120, 12).createFromHTML(formHtml).setOrigin(0, 0);
        this.domElements.push(formDom);

        // イベントリスナーの登録
        setTimeout(() => {
            const loadBtn = document.getElementById('editor-yt-load-btn');
            const urlInput = document.getElementById('editor-yt-url-input');

            if (loadBtn && urlInput) {
                const handleLoad = () => {
                    const inputVal = urlInput.value;
                    const extractedId = this.extractYouTubeId(inputVal);
                    if (extractedId) {
                        this.chart.youtubeId = extractedId;
                        this.loadYouTubeVideo(extractedId);
                    } else {
                        alert('有効なYouTube URLを入力してください。');
                    }
                };

                loadBtn.onclick = handleLoad;
                urlInput.onkeypress = (e) => {
                    if (e.key === 'Enter') handleLoad();
                };
            }
        }, 100);

        // 💾 保存ボタン
        const saveBtn = this.add.text(screenWidth - 100, 15, '💾 保存', {
            fontSize: '15px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#16a34a',
            padding: { x: 14, y: 5 }
        }).setInteractive({ useHandCursor: true });

        saveBtn.on('pointerdown', () => {
            console.log('--- 💾 譜面JSONデータ ---');
            console.log(JSON.stringify(this.chart.toJSON(), null, 2));
            alert('譜面データをコンソールに出力しました！');
        });
    }

    createPreviewArea(screenWidth, screenHeight) {
        this.previewX = 20;
        this.previewY = 55;
        this.previewWidth = 800;
        this.previewHeight = 450;

        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRect(this.previewX, this.previewY, this.previewWidth, this.previewHeight);
        bg.lineStyle(2, 0x334155, 1);
        bg.strokeRect(this.previewX, this.previewY, this.previewWidth, this.previewHeight);
    }

    createParameterPanel(screenWidth, screenHeight) {
        const panelX = 840;
        const panelY = 55;
        const panelWidth = screenWidth - panelX - 20;
        const panelHeight = 450;

        const bg = this.add.graphics();
        bg.fillStyle(0x1e293b, 0.95);
        bg.fillRect(panelX, panelY, panelWidth, panelHeight);
        bg.lineStyle(2, 0x334155, 1);
        bg.strokeRect(panelX, panelY, panelWidth, panelHeight);

        this.add.text(panelX + 15, panelY + 15, '⚙️ 弾幕属性', {
            fontSize: '18px', fontWeight: 'bold', fill: '#00ffff'
        });

        this.paramInfoText = this.add.text(panelX + 15, panelY + 50, 'タイムライン上のノードを\n選択すると詳細設定が表示されます', {
            fontSize: '13px', fill: '#94a3b8', lineSpacing: 6
        });
    }

    createTimelineArea(screenWidth, screenHeight) {
        this.tlX = 20;
        this.tlY = 520;
        this.tlWidth = screenWidth - 40;
        this.tlHeight = 180;

        const bg = this.add.graphics();
        bg.fillStyle(0x020617, 0.95);
        bg.fillRect(this.tlX, this.tlY, this.tlWidth, this.tlHeight);
        bg.lineStyle(2, 0x1e293b, 1);
        bg.strokeRect(this.tlX, this.tlY, this.tlWidth, this.tlHeight);

        // 再生 / 停止ボタン
        this.playBtn = this.add.text(this.tlX + 15, this.tlY + 12, '▶ 再生', {
            fontSize: '14px', fontWeight: 'bold', fill: '#ffffff', backgroundColor: '#2563eb', padding: { x: 12, y: 6 }
        }).setInteractive({ useHandCursor: true });

        this.playBtn.on('pointerdown', () => this.togglePlay());

        this.timeDisplay = this.add.text(this.tlX + 110, this.tlY + 16, '00:00.000 / 03:00.000', {
            fontSize: '15px', fontFamily: 'Monospace', fill: '#00ffff'
        });

        const addBtn = this.add.text(this.tlX + this.tlWidth - 130, this.tlY + 12, '➕ 弾幕を配置', {
            fontSize: '14px', fontWeight: 'bold', fill: '#ffffff', backgroundColor: '#16a34a', padding: { x: 12, y: 6 }
        }).setInteractive({ useHandCursor: true });

        addBtn.on('pointerdown', () => {
            const newEv = this.chart.addEvent(this.currentTimeMs, BULLET_TYPES.NORMAL);
            this.selectedEventId = newEv.id;
            this.renderTimelineNodes();
        });

        this.laneX = this.tlX + 15;
        this.laneY = this.tlY + 55;
        this.laneWidth = this.tlWidth - 30;
        this.laneHeight = 105;

        const laneBg = this.add.graphics();
        laneBg.fillStyle(0x0f172a, 1);
        laneBg.fillRect(this.laneX, this.laneY, this.laneWidth, this.laneHeight);

        const laneZone = this.add.zone(this.laneX, this.laneY, this.laneWidth, this.laneHeight).setOrigin(0).setInteractive();
        laneZone.on('pointerdown', (pointer) => {
            const clickX = pointer.x - this.laneX;
            const targetRatio = Phaser.Math.Clamp(clickX / this.laneWidth, 0, 1);
            this.seekToMs(targetRatio * this.totalDurationMs);
        });

        this.playhead = this.add.graphics();
        this.updatePlayhead();

        this.nodeContainer = this.add.container(0, 0);
        this.renderTimelineNodes();
    }

    renderTimelineNodes() {
        this.nodeContainer.removeAll(true);
        this.nodeViews.clear();

        this.chart.attackPattern.forEach(event => {
            const ratio = event.time / this.totalDurationMs;
            const nodeX = this.laneX + (ratio * this.laneWidth);
            const nodeY = this.laneY + 50;

            const isSelected = (event.id === this.selectedEventId);
            const nodeContainer = this.add.container(nodeX, nodeY);
            
            const shape = this.add.polygon(0, 0, [0, -12, 12, 0, 0, 12, -12, 0], isSelected ? 0x00ffff : 0xff00ff, 1);
            shape.setStrokeStyle(2, isSelected ? 0xffffff : 0x000000);

            const label = this.add.text(0, 18, `${(event.time / 1000).toFixed(1)}s`, {
                fontSize: '11px', fontFamily: 'Monospace', fill: isSelected ? '#00ffff' : '#94a3b8'
            }).setOrigin(0.5);

            nodeContainer.add([shape, label]);
            nodeContainer.setSize(24, 24);
            nodeContainer.setInteractive({ useHandCursor: true, draggable: true });

            nodeContainer.on('pointerdown', () => {
                this.selectedEventId = event.id;
                this.renderTimelineNodes();
                this.updateParamPanelText(event);
            });

            nodeContainer.on('drag', (pointer, dragX) => {
                const clampedX = Phaser.Math.Clamp(dragX, this.laneX, this.laneX + this.laneWidth);
                nodeContainer.x = clampedX;
                const newRatio = (clampedX - this.laneX) / this.laneWidth;
                const newTimeMs = Math.round(newRatio * this.totalDurationMs);
                this.chart.updateEvent(event.id, { time: newTimeMs });
                label.setText(`${(newTimeMs / 1000).toFixed(1)}s`);
            });

            nodeContainer.on('dragend', () => this.renderTimelineNodes());

            this.nodeContainer.add(nodeContainer);
            this.nodeViews.set(event.id, nodeContainer);
        });
    }

    updatePlayhead() {
        this.playhead.clear();
        const ratio = this.currentTimeMs / this.totalDurationMs;
        const x = this.laneX + (ratio * this.laneWidth);

        this.playhead.lineStyle(2, 0xff0000, 1);
        this.playhead.lineBetween(x, this.laneY, x, this.laneY + this.laneHeight);
    }

    formatTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const sec = (totalSec % 60).toString().padStart(2, '0');
        const milli = Math.floor(ms % 1000).toString().padStart(3, '0');
        return `${min}:${sec}.${milli}`;
    }

    /**
     * PhaserのScale.FIT倍率と画面位置に合わせてYouTube divを動的に正確配置する
     */
    updateYouTubePosition() {
        const playerElem = document.getElementById('youtube-player');
        if (!playerElem) return;

        // Phaserキャンバスの実際のスクリーン座標と縮小比率を取得
        const bounds = this.scale.canvasBounds;
        const scaleX = bounds.width / 1280;
        const scaleY = bounds.height / 720;

        const realLeft = bounds.x + (this.previewX * scaleX);
        const realTop = bounds.y + (this.previewY * scaleY);
        const realWidth = this.previewWidth * scaleX;
        const realHeight = this.previewHeight * scaleY;

        playerElem.style.display = 'block';
        playerElem.style.position = 'fixed'; // FIXED指定で確実にキャンバス上に載せる
        playerElem.style.left = `${realLeft}px`;
        playerElem.style.top = `${realTop}px`;
        playerElem.style.width = `${realWidth}px`;
        playerElem.style.height = `${realHeight}px`;
        playerElem.style.zIndex = '500'; // キャンバスより前面に表示
        playerElem.style.pointerEvents = 'auto';
    }

    setupYouTubePlayer() {
        this.updateYouTubePosition();
        this.loadYouTubeVideo(this.chart.youtubeId);
    }

    /**
     * 自動再生を防止し、MV動画を停止状態で待機させる（cueVideoByIdを使用）
     */
    loadYouTubeVideo(youtubeId) {
        if (!youtubeId) return;

        const currentOrigin = window.location.origin || (window.location.protocol + '//' + window.location.host);
        const playerVarsConfig = {
            'autoplay': 0, // 自動再生OFF
            'controls': 1,
            'disablekb': 0,
            'rel': 0,
            'enablejsapi': 1,
            'origin': currentOrigin
        };

        const yt = window.ytPlayer || (window.YT && window.YT.Player ? window.ytPlayer : null);

        if (yt && typeof yt.cueVideoById === 'function') {
            // 🌟 loadVideoById ではなく cueVideoById を使用して勝手な再生を防ぐ
            yt.cueVideoById({
                videoId: youtubeId
            });
            this.isPlaying = false;
            this.playBtn.setText('▶ 再生');
        } else if (window.YT && window.YT.Player) {
            window.ytPlayer = new window.YT.Player('youtube-player', {
                videoId: youtubeId,
                host: 'https://www.youtube-nocookie.com',
                playerVars: playerVarsConfig,
                events: {
                    'onReady': (e) => {
                        this.isPlaying = false;
                        if (e.target.getDuration) {
                            const dur = e.target.getDuration();
                            if (dur > 0) this.totalDurationMs = dur * 1000;
                        }
                    }
                }
            });
        }
    }

    togglePlay() {
        const yt = window.ytPlayer;
        if (!yt) return;

        if (this.isPlaying) {
            if (typeof yt.pauseVideo === 'function') yt.pauseVideo();
            this.isPlaying = false;
            this.playBtn.setText('▶ 再生');
        } else {
            if (typeof yt.playVideo === 'function') yt.playVideo();
            this.isPlaying = true;
            this.playBtn.setText('⏸ 停止');
        }
    }

    seekToMs(ms) {
        this.currentTimeMs = ms;
        const yt = window.ytPlayer;
        if (yt && typeof yt.seekTo === 'function') {
            yt.seekTo(ms / 1000, true);
        }
        this.updatePlayhead();
    }

    updateParamPanelText(event) {
        const typeInfo = BulletRegistry.getInfo(event.type);
        this.paramInfoText.setText(
            `【選択中の弾幕】\n` +
            `ID: ${event.id}\n` +
            `種類: ${typeInfo.name}\n` +
            `発射時間: ${this.formatTime(event.time)}`
        );
    }

    cleanupDomElements() {
        this.domElements.forEach(el => {
            if (el && el.destroy) el.destroy();
        });
        this.domElements = [];
    }

    update() {
        const yt = window.ytPlayer;
        if (this.isPlaying && yt && typeof yt.getCurrentTime === 'function') {
            this.currentTimeMs = yt.getCurrentTime() * 1000;
            if (yt.getDuration) {
                const dur = yt.getDuration();
                if (dur > 0) this.totalDurationMs = dur * 1000;
            }
            this.updatePlayhead();
            this.timeDisplay.setText(`${this.formatTime(this.currentTimeMs)} / ${this.formatTime(this.totalDurationMs)}`);
        }
    }
}