import { Boss4 } from '../bosses/Boss4.js';

export const なかよしステップ = {
    title: "なかよしステップ",
    artist: "キノシタ",
    // 💡 YouTubeの動画ID（URLの「v=xxxx」の後ろの英数字です）
    youtubeId: "z0om-L-VNv4", 
    
    // 💡 この曲で呼び出すボス
    bossClass: Boss4, 

    // 💡 必要に応じて、曲固有の設定（BPMやノーツタイミングなど）をここに増やせます
    settings: {
        volume: 50
    }
};