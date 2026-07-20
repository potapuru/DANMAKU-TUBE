import Phaser from 'phaser';

export class PatternGenerator {
    constructor(scene, attackPatternArray) {
        this.scene = scene;
        this.attackPattern = attackPatternArray;
    }

    // 🌟 中心座標、個数、間隔を指定して一列に並べて発射するパターン（上下左右対応）
    static createCenterLineDown(time, centerPos, count, type, spacing = 80,) {
        const pattern = [];
        const totalSize = (count - 1) * spacing;
        const startPos = centerPos - (totalSize / 2);

        for (let i = 0; i < count; i++) {
            // 計算した並び順の位置（左端、または上端からの位置）
            const calculatedPos = startPos + (i * spacing);

            // 💡 弾の種類（向き）によって、データを分けて登録する
            if (type === 'left' || type === 'right') {
                // 左右から飛ぶ弾の場合：pos には「Y座標（高さ）」を入れる
                pattern.push({
                    at: time,
                    type: type,
                    pos: calculatedPos // 👈 左右の弾が縦一列に並ぶようにする
                });
            } else {
                // 上下から飛ぶ弾の場合（従来通り）：pos には「X座標（横位置）」を入れる
                pattern.push({
                    at: time,
                    type: type,
                    pos: calculatedPos // 👈 上下の弾が横一列に並ぶようにする
                });
            }
        }
        return pattern;
    }

    // 🌟 変更：指定した時間の幅（duration）の間に、指定した個数（count）の弾が上下左右から飛んでくるパターン
    static createFourWayStorm(startTime, duration, count) {
        const pattern = [];
        
        // 指定された時間幅の中に、弾が等間隔で収まるように間隔（ミリ秒）を計算
        // （1個だけの場合は開始時間に発射、複数の場合は均等に分配）
        const interval = count > 1 ? duration / (count - 1) : 0;
        
        // 上下左右のタイプを配列にしておく
        const directions = ['down', 'up', 'left', 'right'];

        for (let i = 0; i < count; i++) {
            const time = Math.floor(startTime + (i * interval));
            
            // 上下左右からランダムに1つ選択
            const type = directions[Math.floor(Math.random() * directions.length)];
            
            let pos = 0;
            if (type === 'down' || type === 'up') {
                // 上下から降る・昇る弾は、画面の横幅（左右に100pxずつの安全余白）の範囲でランダムなX座標
                pos = Math.floor(Math.random() * (window.innerWidth - 200)) + 100;
            } else {
                // 左右から迫る弾は、画面の縦幅（上下に100pxずつの安全余白）の範囲でランダムなY座標
                pos = Math.floor(Math.random() * (window.innerHeight - 200)) + 100;
            }

            pattern.push({
                at: time,
                type: type,
                pos: pos
            });
        }
        
        return pattern;
    }

// 🌟 【修正】中心のX・Y座標、個数を指定して、全方位に広がる弾幕パターン（初期角度を指定可能に！）
    // startAngle: 初期角度（ラジアン）。デフォルトは 0 (真右)
    static createCircleSpread(time, centerX, centerY, count, speed = 4, startAngle = 0) {
        const pattern = [];
        for (let i = 0; i < count; i++) {
            // 💡 360度（2 * Math.PI）を等分した角度に、初期角度（startAngle）を足し算します
            const angle = startAngle + ((i * (2 * Math.PI)) / count);
            pattern.push({
                at: time,
                type: 'circle',
                pos: centerX,
                y: centerY,
                angle: angle,
                speed: speed
            });
        }
        return pattern;
    }

    // 🌟 【修正】中心のX・Y座標、弾の総数、回転速度などを指定してらせん状に発射するパターン（初期角度を指定可能に！）
    // startAngle: 初期角度（ラジアン）。デフォルトは 0 (真右)
    static createSpiralSpread(startTime, centerX, centerY, totalCount, interval = 50, angleStep = 0.2, speed = 4, startAngle = 0) {
        const pattern = [];
        for (let i = 0; i < totalCount; i++) {
            const time = startTime + (i * interval);
            // 💡 1発ごとに回転していく角度のベースに、初期角度（startAngle）を足し算します
            const angle = startAngle + (i * angleStep);
            pattern.push({
                at: time,
                type: 'circle',
                pos: centerX,
                y: centerY,
                angle: angle,
                speed: speed
            });
        }
        return pattern;
    }
    // 🌟 【新規】開始・終了時刻、間隔の最小・最大値、スピードを指定して上下左右からランダムに飛んでくるパターン
    static createRandomStormVariable(startTime, endTime, minInterval, maxInterval, speed = 4) {
        const pattern = [];
        let currentTime = startTime;
        const directions = ['down', 'up', 'left', 'right'];

        // 💡 終了時刻を超えるまで、ランダムな間隔をあけながら弾を生成し続ける
        while (currentTime <= endTime) {
            // 上下左右からランダムに1つ選択
            const type = directions[Math.floor(Math.random() * directions.length)];
            
            let pos = 0;
            if (type === 'down' || type === 'up') {
                pos = Math.floor(Math.random() * (window.innerWidth - 200)) + 100;
            } else {
                pos = Math.floor(Math.random() * (window.innerHeight - 200)) + 100;
            }

            // 弾のデータを追加
            pattern.push({
                at: currentTime,
                type: type,
                pos: pos,
                speed: speed,          // 🛠️ スピードを設定
            });

            // 💡 次の弾の発射時刻を「最小値 〜 最大値」の間でランダムに決定して進める
            const nextInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
            currentTime += nextInterval;
        }
        
        return pattern;
    }

    // 🎯 【新規】上下左右からランダムな間隔で飛んでくる「ホーミング専用」の嵐パターン
    // turnSpeed: 弾がプレイヤーに向かって曲がる強さ（追尾の強さ）
    static createHomingStormVariable(startTime, endTime, minInterval, maxInterval, speed = 3, turnSpeed = 0.05) {
        const pattern = [];
        let currentTime = startTime;
        const directions = ['down', 'up', 'left', 'right'];

        while (currentTime <= endTime) {
            const type = directions[Math.floor(Math.random() * directions.length)];
            
            let pos = 0;
            if (type === 'down' || type === 'up') {
                pos = Math.floor(Math.random() * (window.innerWidth - 200)) + 100;
            } else {
                pos = Math.floor(Math.random() * (window.innerHeight - 200)) + 100;
            }

            pattern.push({
                at: currentTime,
                type: type,
                pos: pos,
                speed: speed,
                bulletType: 'homing', // ボス側にホーミング弾だと伝える
                turnSpeed: turnSpeed  // 💡 パターンごとに追尾の強さを個別に設定できるようにデータを持たせる
            });

            const nextInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
            currentTime += nextInterval;
        }
        return pattern;
    }

    // 🌊 【新規】上下左右からランダムな間隔で飛んでくる「ウェーブ（サイン波）専用」の嵐パターン
    // waveAmplitude: 波の揺れ幅（どれくらい大きく左右に揺れるか）
    // waveFrequency: 波の細かさ（どれくらい激しくウネウネするか）
    static createWaveStormVariable(startTime, endTime, minInterval, maxInterval, speed = 4, waveAmplitude = 30, waveFrequency = 0.02) {
        const pattern = [];
        let currentTime = startTime;
        const directions = ['down', 'up', 'left', 'right'];

        while (currentTime <= endTime) {
            const type = directions[Math.floor(Math.random() * directions.length)];
            
            let pos = 0;
            if (type === 'down' || type === 'up') {
                pos = Math.floor(Math.random() * (window.innerWidth - 200)) + 100;
            } else {
                pos = Math.floor(Math.random() * (window.innerHeight - 200)) + 100;
            }

            pattern.push({
                at: currentTime,
                type: type,
                pos: pos,
                speed: speed,
                bulletType: 'wave',
                waveAmplitude: waveAmplitude, // 💡 パターンごとに揺れの大きさを設定
                waveFrequency: waveFrequency  // 💡 パターンごとにウネウネ度を設定
            });

            const nextInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
            currentTime += nextInterval;
        }
        return pattern;
    }
}