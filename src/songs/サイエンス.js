import { Boss1 } from '../bosses/Boss1.js';

export const サイエンス = {
    title: "サイエンス",
    artist: "MIMI",
    // 💡 YouTubeの動画ID（URLの「v=xxxx」の後ろの英数字です）
    youtubeId: "m-bvW4pKT68", 
    
    // 💡 この曲で呼び出すボス
    bossClass: Boss1, 

    // 💡 必要に応じて、曲固有の設定（BPMやノーツタイミングなど）をここに増やせます
    settings: {
        volume: 50
    }
};