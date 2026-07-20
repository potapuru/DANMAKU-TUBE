export const BulletConfig = {
    down: {
        radius: 18,    // 弾の半径
        color: 0xe5ff00, // 弾の色（16進数）
        speedY: 5, // まっすぐ下に飛ぶスピード
        speedX: 0, // まっすぐ右に飛ぶスピード
        damage: 15 // 弾のダメージ量
    },
    up: {
        radius: 18,
        color: 0xe5ff00,
        speedY: -5,
        speedX: 0,
        damage: 15
    },
    left: {
        radius: 18,
        color: 0xe5ff00,
        speedY: 0,
        speedX: -5,
        damage: 15
    },
    right: {
        radius: 18,
        color: 0xe5ff00,
        speedY: 0,
        speedX: 5,
        damage: 15
    },
    homing: {
        radius: 10,
        color: 0xff00ff,
        speed: 3,
        turnSpeed: 0.005, // 追尾の回転速度
        damage: 10
    },
    wave: {
        radius: 10,
        color: 0x00ff00,
        speed: 3,
        waveFrequency: 0.1, // 波の細かさ
        waveAmplitude: 50, // 波の大きさ
        damage: 10
    },
    laser: {
        laserWidth: 80, // ビームの幅
        color: 0xff0000, // ビームの色
        damage: 2,         // 1フレームあたりのダメージ
        warningDuration: 90, // 警告時間（フレーム数）
        beamDuration: 120    // ビーム照射時間（フレーム数）
    }
};