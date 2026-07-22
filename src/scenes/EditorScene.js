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
            youtubeId: ''
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

        // 🌟 他の画面に遷移した時（シーン停止時）に確実に入力バーを消去する
        this.events.once('shutdown', () => this.cleanupDomElements());
        this.events.once('destroy', () => this.cleanupDomElements());
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
        // 🔙 BACKボタン (x: 20, y: 12)
        const backBtn = this.add.text(25, 15, '← BACK', {
            fontSize: '15px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#1e293b',
            padding: { x: 10, y: 6 }
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

        // 🌟 既存の入力バー要素があれば削除
        const oldForm = document.getElementById('editor-yt-form-container');
        if (oldForm) oldForm.remove();

        // 🌟 HTML DOMを直接作成して最前面（z-index: 99999）に配置
        const formContainer = document.createElement('div');
        formContainer.id = 'editor-yt-form-container';
        formContainer.style.cssText = `
            position: absolute;
            left: 120px;
            top: 10px;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: Arial, sans-serif;
            pointer-events: auto;
        `;

        formContainer.innerHTML = `
            <span style="color: #94a3b8; font-size: 13px; font-weight: bold; white-space: nowrap;">🔗 URL:</span>
            <input type="text" id="editor-yt-url-input" 
                   value="https://www.youtube.com/watch?v=${this.chart ? this.chart.youtubeId : 'dQw4w9WgXcQ'}" 
                   placeholder="https://www.youtube.com/watch?v=..." 
                   style="width: 320px; padding: 5px 8px; background: #0f172a; color: #00ffff; border: 1px solid #334155; border-radius: 4px; font-size: 13px; outline: none;" />
            <button id="editor-yt-load-btn" 
                    style="padding: 5px 12px; background: #2563eb; color: #ffffff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 13px; white-space: nowrap;">
                読み込む
            </button>
            </div>

                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: #94a3b8; font-size: 13px; font-weight: bold; white-space: nowrap;">🏷️ タイトル:</span>
                    <input type="text" id="editor-title-input" 
                           value="${this.chart && this.chart.title ? this.chart.title : ''}" 
                           placeholder="曲名・譜面名を入力..." 
                           style="width: 200px; padding: 5px 8px; background: #0f172a; color: #ffffff; border: 1px solid #334155; border-radius: 4px; font-size: 13px; outline: none;" />
                </div>
            </div>
        `;

        // game-container 内に追加
        const gameContainer = document.getElementById('game-container') || document.body;
        gameContainer.appendChild(formContainer);

        // イベントリスナーの登録
        const loadBtn = document.getElementById('editor-yt-load-btn');
        const urlInput = document.getElementById('editor-yt-url-input');
        const titleInput = document.getElementById('editor-title-input');

        if (loadBtn && urlInput) {
            const handleLoad = () => {
                const inputVal = urlInput.value;
                const extractedId = this.extractYouTubeId(inputVal);
                if (extractedId) {
                    if (this.chart) this.chart.youtubeId = extractedId;
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
        // タイトル変更時に chart オブジェクトの title もリアルタイム更新
        if (titleInput) {
            titleInput.oninput = () => {
                if (this.chart) {
                    this.chart.title = titleInput.value;
                }
            };
        }

        // 💾 保存ボタン
        const saveBtn = this.add.text(screenWidth - 100, 12, '💾 保存', {
            fontSize: '15px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#16a34a',
            padding: { x: 14, y: 6 }
        }).setInteractive({ useHandCursor: true });

        saveBtn.on('pointerdown', () => {
            if (this.chart) {
                console.log('--- 💾 譜面JSONデータ ---');
                console.log(JSON.stringify(this.chart.toJSON(), null, 2));
            }
            alert('譜面データを保存・出力しました！');
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

        // 背景描画
        const bg = this.add.graphics();
        bg.fillStyle(0x1e293b, 0.95);
        bg.fillRect(panelX, panelY, panelWidth, panelHeight);
        bg.lineStyle(2, 0x334155, 1);
        bg.strokeRect(panelX, panelY, panelWidth, panelHeight);

        // タイトル
        this.add.text(panelX + 15, panelY + 15, '⚙️ 弾幕属性', {
            fontSize: '18px', fontWeight: 'bold', fill: '#00ffff'
        });

        // パラメータ入力用 HTML フォームの埋め込み
        const paramHtml = `
            <div id="editor-param-form" style="width: 380px; color: #ffffff; font-family: Arial, sans-serif; font-size: 13px; pointer-events: auto; display: none;">
                <div style="margin-bottom: 10px;">
                    <label style="color: #94a3b8; display: block; margin-bottom: 4px;">弾の種類:</label>
                    <select id="param-type" style="width: 100%; padding: 5px; background: #0f172a; color: #00ffff; border: 1px solid #334155; border-radius: 4px;">
                        <option value="NORMAL">通常弾 (NORMAL)</option>
                        <option value="RING">リング弾 (RING)</option>
                        <option value="WAY">WAY弾 (WAY)</option>
                        <option value="SPIRAL">渦巻き弾 (SPIRAL)</option>
                    </select>
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <label style="color: #94a3b8; display: block; margin-bottom: 4px;">速度:</label>
                        <input type="number" id="param-speed" value="200" step="10" style="width: 90%; padding: 5px; background: #0f172a; color: #ffffff; border: 1px solid #334155; border-radius: 4px;" />
                    </div>
                    <div style="flex: 1;">
                        <label style="color: #94a3b8; display: block; margin-bottom: 4px;">弾数 (WAY/RING):</label>
                        <input type="number" id="param-count" value="5" min="1" max="64" style="width: 90%; padding: 5px; background: #0f172a; color: #ffffff; border: 1px solid #334155; border-radius: 4px;" />
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label style="color: #94a3b8; display: block; margin-bottom: 4px;">発射角度 (°):</label>
                        <input type="number" id="param-angle" value="90" step="5" style="width: 90%; padding: 5px; background: #0f172a; color: #ffffff; border: 1px solid #334155; border-radius: 4px;" />
                    </div>
                    <div style="flex: 1;">
                        <label style="color: #94a3b8; display: block; margin-bottom: 4px;">拡散角度 (°):</label>
                        <input type="number" id="param-spread" value="60" step="5" style="width: 90%; padding: 5px; background: #0f172a; color: #ffffff; border: 1px solid #334155; border-radius: 4px;" />
                    </div>
                </div>
                <button id="param-preview-btn" style="width: 100%; padding: 8px; background: #8b5cf6; color: #ffffff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
                    🚀 試射プレビュー (テスト発射)
                </button>
            </div>
            <div id="param-placeholder" style="color: #94a3b8; font-size: 13px; margin-top: 20px; line-spacing: 6px;">
                タイムライン上のノードを選択すると<br>詳細パラメータを設定できます。
            </div>
        `;

        const paramDom = this.add.dom(panelX + 15, panelY + 50).createFromHTML(paramHtml).setOrigin(0, 0);
        this.domElements.push(paramDom);

        // フォーム変更のリアルタイム検知イベント設定
        setTimeout(() => {
            const ids = ['param-type', 'param-speed', 'param-count', 'param-angle', 'param-spread'];
            ids.forEach(id => {
                const elem = document.getElementById(id);
                if (elem) {
                    elem.oninput = () => this.applyParamChanges();
                    elem.onchange = () => this.applyParamChanges();
                }
            });

            const testBtn = document.getElementById('param-preview-btn');
            if (testBtn) {
                testBtn.onclick = () => this.triggerPreviewShot();
            }
        }, 100);
    }

/**
     * 4. タイムラインエリアの実装
     */
    createTimelineArea(screenWidth, screenHeight) {
        this.tlX = 20;
        this.tlY = 520;
        this.tlWidth = screenWidth - 40;
        this.tlHeight = 180;

        // 背景
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

        // 時間表示
        this.timeDisplay = this.add.text(this.tlX + 110, this.tlY + 16, '00:00.000 / 03:00.000', {
            fontSize: '15px', fontFamily: 'Monospace', fill: '#00ffff'
        });

        // ➕ 弾幕を配置ボタン（現在の時間位置にノードを追加）
        const addBtn = this.add.text(this.tlX + this.tlWidth - 130, this.tlY + 12, '➕ 弾幕を配置', {
            fontSize: '14px', fontWeight: 'bold', fill: '#ffffff', backgroundColor: '#16a34a', padding: { x: 12, y: 6 }
        }).setInteractive({ useHandCursor: true });

        addBtn.on('pointerdown', () => {
            if (!this.chart) return;
            // 現在の再生時間の位置に新しい弾幕イベントを追加
            const newEv = this.chart.addEvent(Math.round(this.currentTimeMs), BULLET_TYPES.NORMAL || 'NORMAL');
            this.selectedEventId = newEv.id;
            this.renderTimelineNodes();
            this.updateParamPanelText(newEv);
        });

        // タイムラインレーン設定
        this.laneX = this.tlX + 15;
        this.laneY = this.tlY + 55;
        this.laneWidth = this.tlWidth - 30;
        this.laneHeight = 105;

        const laneBg = this.add.graphics();
        laneBg.fillStyle(0x0f172a, 1);
        laneBg.fillRect(this.laneX, this.laneY, this.laneWidth, this.laneHeight);

        // レーンクリックでその時間へシーク
        const laneZone = this.add.zone(this.laneX, this.laneY, this.laneWidth, this.laneHeight).setOrigin(0).setInteractive();
        laneZone.on('pointerdown', (pointer) => {
            const clickX = pointer.x - this.laneX;
            const targetRatio = Phaser.Math.Clamp(clickX / this.laneWidth, 0, 1);
            this.seekToMs(targetRatio * this.totalDurationMs);
        });

        // プレイヘッド（赤線）
        this.playhead = this.add.graphics();
        this.updatePlayhead();

        // ノード描画用コンテナ
        this.nodeContainer = this.add.container(0, 0);
        this.renderTimelineNodes();
    }

/**
     * タイムライン上のイベントノードを再描画する処理（ドラッグ＆ドロップ完全対応）
     */
    renderTimelineNodes() {
        if (!this.nodeContainer || !this.chart) return;

        this.nodeContainer.removeAll(true);
        this.nodeViews.clear();

        // Phaserのドラッグイベントリスナー（二重登録を防ぐため一度解除）
        this.input.off('drag');
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (!gameObject.eventId) return;

            // X座標をレーン内に収める
            const clampedX = Phaser.Math.Clamp(dragX, this.laneX, this.laneX + this.laneWidth);
            gameObject.x = clampedX;

            // 座標から時間を逆算して更新
            const newRatio = (clampedX - this.laneX) / this.laneWidth;
            const newTimeMs = Math.round(newRatio * this.totalDurationMs);

            // ChartModelのデータを更新
            this.chart.updateEvent(gameObject.eventId, { time: newTimeMs });

            // ノード下部の時間テキスト更新
            if (gameObject.label) {
                gameObject.label.setText(`${(newTimeMs / 1000).toFixed(1)}s`);
            }
        });

        // ドラッグ終了時に全ノードを再描画＆時間順ソート
        this.input.off('dragend');
        this.input.on('dragend', (pointer, gameObject) => {
            if (gameObject.eventId) {
                this.renderTimelineNodes();
            }
        });

        // チャート内のイベント一覧を取得
        const events = this.chart.attackPattern || [];

        events.forEach(event => {
            const ratio = this.totalDurationMs > 0 ? (event.time / this.totalDurationMs) : 0;
            const nodeX = this.laneX + (ratio * this.laneWidth);
            const nodeY = this.laneY + 50;

            const isSelected = (event.id === this.selectedEventId);
            const nodeGroup = this.add.container(nodeX, nodeY);
            nodeGroup.eventId = event.id; // イベントIDを保持

            // ノードの見た目（ひし形）
            const shape = this.add.polygon(0, 0, [0, -12, 12, 0, 0, 12, -12, 0], isSelected ? 0x00ffff : 0xff00ff, 1);
            shape.setStrokeStyle(2, isSelected ? 0xffffff : 0x000000);

            // ノード下の時間テキスト
            const label = this.add.text(0, 18, `${(event.time / 1000).toFixed(1)}s`, {
                fontSize: '11px', fontFamily: 'Monospace', fill: isSelected ? '#00ffff' : '#94a3b8'
            }).setOrigin(0.5);

            nodeGroup.label = label;
            nodeGroup.add([shape, label]);

            // 🌟 物理判定用のサイズ指定とヒットエリア作成
            nodeGroup.setSize(30, 30);
            const hitArea = new Phaser.Geom.Rectangle(-15, -15, 30, 30);
            nodeGroup.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
            
            // 🌟 Phaser全体のインプットシステムにドラッグ可能として登録
            this.input.setDraggable(nodeGroup);

            // 選択タップ時の処理
            nodeGroup.on('pointerdown', () => {
                this.selectedEventId = event.id;
                this.updateParamPanelText(event);
            });

            this.nodeContainer.add(nodeGroup);
            this.nodeViews.set(event.id, nodeGroup);
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

    updateYouTubePosition() {
        const playerElem = document.getElementById('youtube-player');
        if (!playerElem) return;

        const bounds = this.scale.canvasBounds;
        const scaleX = bounds.width / 1280;
        const scaleY = bounds.height / 720;

        const realLeft = bounds.x + (this.previewX * scaleX);
        const realTop = bounds.y + (this.previewY * scaleY);
        const realWidth = this.previewWidth * scaleX;
        const realHeight = this.previewHeight * scaleY;

        playerElem.style.display = 'block';
        playerElem.style.position = 'fixed';
        playerElem.style.left = `${realLeft}px`;
        playerElem.style.top = `${realTop}px`;
        playerElem.style.width = `${realWidth}px`;
        playerElem.style.height = `${realHeight}px`;
        playerElem.style.zIndex = '100'; // 🌟 z-indexを100に設定（URL入力フォームの99999より下にする）
        playerElem.style.pointerEvents = 'auto';
    }

    setupYouTubePlayer() {
        this.updateYouTubePosition();
        this.loadYouTubeVideo(this.chart.youtubeId);
        // 🌟 シーンが終了（他の画面へ遷移）した際に自動でHTML入力欄を消去する
        this.events.once('shutdown', () => this.cleanupDomElements());
        this.events.once('destroy', () => this.cleanupDomElements());
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
        const form = document.getElementById('editor-param-form');
        const placeholder = document.getElementById('param-placeholder');

        if (!event) {
            if (form) form.style.display = 'none';
            if (placeholder) placeholder.style.display = 'block';
            return;
        }

        if (form) form.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';

        // 値の反映
        const typeEl = document.getElementById('param-type');
        const speedEl = document.getElementById('param-speed');
        const countEl = document.getElementById('param-count');
        const angleEl = document.getElementById('param-angle');
        const spreadEl = document.getElementById('param-spread');

        if (typeEl) typeEl.value = event.type || 'NORMAL';
        if (speedEl) speedEl.value = event.speed || 200;
        if (countEl) countEl.value = event.count || 5;
        if (angleEl) angleEl.value = event.angle || 90;
        if (spreadEl) spreadEl.value = event.spread || 60;
    }

    cleanupDomElements() {
        // 🌟 YouTube プレイヤー（iframe/div）を完全に画面から消去
        const ytElem = document.getElementById('youtube-player');
        if (ytElem) {
            ytElem.style.display = 'none';
            // 親要素があれば完全に要素を取り除く
            if (ytElem.parentNode) {
                ytElem.parentNode.removeChild(ytElem);
            }
        }

        // 🌟 YouTubeの再生を停止
        if (window.ytPlayer && typeof window.ytPlayer.pauseVideo === 'function') {
            try {
                window.ytPlayer.pauseVideo();
            } catch (e) {
                console.log(e);
            }
        }

        // 🌟 ヘッダーのURL/タイトル入力バーを完全削除
        const formContainer = document.getElementById('editor-yt-form-container');
        if (formContainer) {
            formContainer.remove();
        }

        // 🌟 Phaser の DOM Overlay 要素を全て破棄
        if (this.domElements) {
            this.domElements.forEach(el => {
                if (el && el.destroy) {
                    el.destroy();
                }
            });
            this.domElements = [];
        }
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

    applyParamChanges() {
        if (!this.selectedEventId || !this.chart) return;

        const typeEl = document.getElementById('param-type');
        const speedEl = document.getElementById('param-speed');
        const countEl = document.getElementById('param-count');
        const angleEl = document.getElementById('param-angle');
        const spreadEl = document.getElementById('param-spread');

        const updatedParams = {
            type: typeEl ? typeEl.value : 'NORMAL',
            speed: speedEl ? parseFloat(speedEl.value) : 200,
            count: countEl ? parseInt(countEl.value, 10) : 5,
            angle: angleEl ? parseFloat(angleEl.value) : 90,
            spread: spreadEl ? parseFloat(spreadEl.value) : 60
        };

        // データモデルの更新
        this.chart.updateEvent(this.selectedEventId, updatedParams);
    }

    triggerPreviewShot() {
        if (!this.selectedEventId || !this.chart) return;
        const ev = this.chart.attackPattern.find(e => e.id === this.selectedEventId);
        if (!ev) return;

        console.log('🚀 試射実行:', ev);
        // ※ 弾のプレビュー生成処理（PatternGenerator呼び出し等）をここに接続できます
    }
}