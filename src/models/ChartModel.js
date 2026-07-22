import { BulletRegistry, BULLET_TYPES } from './BulletRegistry.js';

export class ChartModel {
    constructor(data = {}) {
        this.schemaVersion = '1.0';
        this.id = data.id || `chart_${Date.now()}`;
        this.title = data.title || '新しい譜面';
        this.artist = data.artist || 'Unknown Artist';
        this.youtubeId = data.youtubeId || '';
        this.difficulty = data.difficulty || 'Normal';
        this.author = data.author || '匿名クリエイター';
        this.createdAt = data.createdAt || new Date().toISOString();
        
        // 弾幕イベント配列 (時間順でソートを自動維持)
        this.attackPattern = Array.isArray(data.attackPattern) ? data.attackPattern : [];
        this.sortEvents();
    }

    /**
     * イベントを時間(ms)昇順に並び替え
     */
    sortEvents() {
        this.attackPattern.sort((a, b) => a.time - b.time);
    }

    /**
     * 新しい弾幕イベントを追加
     */
    addEvent(timeMs, type = BULLET_TYPES.NORMAL, customParams = {}) {
        const defaultParams = BulletRegistry.getDefaultParams(type);
        const newEvent = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            time: Math.round(timeMs),
            type: type,
            params: { ...defaultParams, ...customParams }
        };
        
        this.attackPattern.push(newEvent);
        this.sortEvents();
        return newEvent;
    }

    /**
     * 指定IDのイベントを更新
     */
    updateEvent(eventId, updatedFields) {
        const event = this.attackPattern.find(e => e.id === eventId);
        if (!event) return false;

        if (updatedFields.time !== undefined) {
            event.time = Math.round(updatedFields.time);
            this.sortEvents();
        }
        if (updatedFields.type !== undefined && updatedFields.type !== event.type) {
            event.type = updatedFields.type;
            event.params = BulletRegistry.getDefaultParams(updatedFields.type);
        }
        if (updatedFields.params !== undefined) {
            event.params = { ...event.params, ...updatedFields.params };
        }
        return true;
    }

    /**
     * 指定IDのイベントを削除
     */
    removeEvent(eventId) {
        const index = this.attackPattern.findIndex(e => e.id === eventId);
        if (index !== -1) {
            this.attackPattern.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * JSON文字列としてエクスポート
     */
    toJSON() {
        return {
            schemaVersion: this.schemaVersion,
            id: this.id,
            title: this.title,
            artist: this.artist,
            youtubeId: this.youtubeId,
            difficulty: this.difficulty,
            author: this.author,
            createdAt: this.createdAt,
            attackPattern: this.attackPattern
        };
    }

    /**
     * JSONデータから ChartModel インスタンスを安全に生成
     */
    static fromJSON(jsonObj) {
        if (typeof jsonObj === 'string') {
            try {
                jsonObj = JSON.parse(jsonObj);
            } catch (e) {
                console.error('無効なJSONフォーマットです:', e);
                return new ChartModel();
            }
        }
        return new ChartModel(jsonObj);
    }
}