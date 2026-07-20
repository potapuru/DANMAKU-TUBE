import { Boss5 } from '../bosses/Boss5.js';

export const バグ = {
    title: "バグ",
    artist: "かいりきベア",
    // 💡 YouTubeの動画ID（URLの「v=xxxx」の後ろの英数字です）
    youtubeId: "FkO8ub83wss", 
    
    // 💡 この曲で呼び出すボス
    bossClass: Boss5, 

    // 💡 必要に応じて、曲固有の設定（BPMやノーツタイミングなど）をここに増やせます
    settings: {
        volume: 50
    }
};