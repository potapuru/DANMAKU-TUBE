/**
 * 🌟 弾幕タイプレジストリ
 * エディタのGUIや弾幕生成エンジンが参照するパラメータ定義集
 */
export const BULLET_TYPES = {
    NORMAL: 'normal',
    HOMING: 'homing',
    WAVE: 'wave',
    CIRCLE: 'circle',
    SPIRAL: 'spiral',
    LASER: 'laser'
};

export class BulletRegistry {
    static registry = {
        [BULLET_TYPES.NORMAL]: {
            name: '通常弾',
            defaultParams: {
                speed: 10,
                count: 1,
                size: 10,
                color: '#00ffff',
                angle: 90,
                spawnX: 0.5,
                spawnY: 0.2
            },
            schema: [
                { key: 'speed', label: '弾速', type: 'range', min: 1, max: 30, step: 1 },
                { key: 'count', label: '弾数', type: 'range', min: 1, max: 10, step: 1 },
                { key: 'size', label: 'サイズ', type: 'range', min: 4, max: 30, step: 1 },
                { key: 'angle', label: '発射角度', type: 'range', min: 0, max: 360, step: 5 },
                { key: 'color', label: 'カラー', type: 'color' },
                { key: 'spawnX', label: '出現X位置', type: 'range', min: 0.1, max: 0.9, step: 0.05 },
                { key: 'spawnY', label: '出現Y位置', type: 'range', min: 0.1, max: 0.5, step: 0.05 }
            ]
        },
        [BULLET_TYPES.HOMING]: {
            name: 'ホーミング弾',
            defaultParams: {
                speed: 8,
                count: 3,
                homingStrength: 5,
                size: 8,
                color: '#ff00ff',
                spawnX: 0.5,
                spawnY: 0.2
            },
            schema: [
                { key: 'speed', label: '弾速', type: 'range', min: 1, max: 20, step: 1 },
                { key: 'count', label: '弾数', type: 'range', min: 1, max: 8, step: 1 },
                { key: 'homingStrength', label: '追尾力', type: 'range', min: 1, max: 10, step: 1 },
                { key: 'size', label: 'サイズ', type: 'range', min: 4, max: 20, step: 1 },
                { key: 'color', label: 'カラー', type: 'color' },
                { key: 'spawnX', label: '出現X位置', type: 'range', min: 0.1, max: 0.9, step: 0.05 },
                { key: 'spawnY', label: '出現Y位置', type: 'range', min: 0.1, max: 0.5, step: 0.05 }
            ]
        },
        [BULLET_TYPES.WAVE]: {
            name: 'ウェーブ弾',
            defaultParams: {
                speed: 7,
                count: 1,
                sway: 15,
                frequency: 5,
                size: 10,
                color: '#ffff00',
                spawnX: 0.5,
                spawnY: 0.2
            },
            schema: [
                { key: 'speed', label: '弾速', type: 'range', min: 1, max: 20, step: 1 },
                { key: 'sway', label: '揺れ幅', type: 'range', min: 5, max: 50, step: 5 },
                { key: 'frequency', label: '振動数', type: 'range', min: 1, max: 15, step: 1 },
                { key: 'size', label: 'サイズ', type: 'range', min: 4, max: 25, step: 1 },
                { key: 'color', label: 'カラー', type: 'color' },
                { key: 'spawnX', label: '出現X位置', type: 'range', min: 0.1, max: 0.9, step: 0.05 },
                { key: 'spawnY', label: '出現Y位置', type: 'range', min: 0.1, max: 0.5, step: 0.05 }
            ]
        },
        [BULLET_TYPES.CIRCLE]: {
            name: '全方位弾',
            defaultParams: {
                speed: 6,
                count: 16,
                size: 8,
                color: '#00ff88',
                spawnX: 0.5,
                spawnY: 0.3
            },
            schema: [
                { key: 'speed', label: '弾速', type: 'range', min: 1, max: 20, step: 1 },
                { key: 'count', label: '全方位弾数', type: 'range', min: 6, max: 36, step: 2 },
                { key: 'size', label: 'サイズ', type: 'range', min: 4, max: 20, step: 1 },
                { key: 'color', label: 'カラー', type: 'color' },
                { key: 'spawnX', label: '出現X位置', type: 'range', min: 0.1, max: 0.9, step: 0.05 },
                { key: 'spawnY', label: '出現Y位置', type: 'range', min: 0.1, max: 0.5, step: 0.05 }
            ]
        }
    };

    /**
     * 登録済みの全弾幕タイプキーを取得
     */
    static getTypes() {
        return Object.keys(this.registry);
    }

    /**
     * 指定されたタイプのメタ情報（名前、パラメータ、UI定義）を取得
     */
    static getInfo(type) {
        return this.registry[type] || this.registry[BULLET_TYPES.NORMAL];
    }

    /**
     * 指定タイプのデフォルトパラメータを取得
     */
    static getDefaultParams(type) {
        const info = this.getInfo(type);
        return JSON.parse(JSON.stringify(info.defaultParams));
    }
}