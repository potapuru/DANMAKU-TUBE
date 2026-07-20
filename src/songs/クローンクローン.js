import { Boss2 } from '../bosses/Boss2.js';

export const クローンクローン = {
    title: "クローンクローン",
    artist: "Atena",
    // 💡 YouTubeの動画ID（URLの「v=xxxx」の後ろの英数字です）
    youtubeId: "bmbAm-fKnbQ", 
    
    // 💡 この曲で呼び出すボス
    bossClass: Boss2, 

    // 💡 必要に応じて、曲固有の設定（BPMやノーツタイミングなど）をここに増やせます
    settings: {
        volume: 50
    }
};