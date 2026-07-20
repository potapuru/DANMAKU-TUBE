import { Boss3 } from '../bosses/Boss3.js';

export const マシュマロ = {
    title: "マシュマロ",
    artist: "DECO*27",
    //imageKey: "thumb_marshmallow",
    // 💡 YouTubeの動画ID（URLの「v=xxxx」の後ろの英数字です）
    youtubeId: "ZIzEnTdR368", 
    
    // 💡 この曲で呼び出すボス
    bossClass: Boss3, 

    // 💡 必要に応じて、曲固有の設定（BPMやノーツタイミングなど）をここに増やせます
    settings: {
        volume: 50
    }
};