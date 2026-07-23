import { 
    operationMode, 
    playerSpeed, 
    setOperationMode, 
    setPlayerSpeed 
} from '../../utils/helpers.js';

export class SettingUI {
    constructor(scene) {
        this.scene = scene;
    }

    create() {
        const screenWidth = this.scene.cameras.main.width;
        const centerX = screenWidth / 2;

        this.createBackButton();
        this.createTitle(centerX);
        this.createOperationModeSettings(centerX);
        this.createPlayerSpeedSettings(centerX);
    }

    // 🔙 戻るボタン
    createBackButton() {
        const backButton = this.scene.add.text(50, 40, '← BACK', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#1e293b',
            padding: { x: 15, y: 8 }
        }).setInteractive({ useHandCursor: true });

        backButton.on('pointerover', () => backButton.setStyle({ fill: '#ffff00', backgroundColor: '#334155' }));
        backButton.on('pointerout', () => backButton.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' }));
        backButton.on('pointerdown', () => {
            this.scene.scene.start('HomeScene');
        });
    }

    // ⚙️ タイトル
    createTitle(centerX) {
        this.scene.add.text(centerX, 60, 'SETTINGS', {
            fontSize: '38px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff'
        }).setOrigin(0.5);
    }

    // 🎮 1. 操作方法の設定 (キーボード / マウス)
    createOperationModeSettings(centerX) {
        this.scene.add.text(centerX, 130, '■ 操作方法の選択', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const keyboardBtn = this.scene.add.text(centerX - 180, 180, '⌨️ キーボード (WASD)', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: operationMode === 'keyboard' ? '#00ffff' : '#ffffff',
            backgroundColor: operationMode === 'keyboard' ? '#1e293b' : '#334155',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const mouseBtn = this.scene.add.text(centerX + 180, 180, '🖱️ マウス / タッチ追従', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: operationMode === 'mouse' ? '#00ffff' : '#ffffff',
            backgroundColor: operationMode === 'mouse' ? '#1e293b' : '#334155',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // イベント設定
        keyboardBtn.on('pointerdown', () => {
            setOperationMode('keyboard');
            keyboardBtn.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' });
            mouseBtn.setStyle({ fill: '#ffffff', backgroundColor: '#334155' });
        });

        mouseBtn.on('pointerdown', () => {
            setOperationMode('mouse');
            keyboardBtn.setStyle({ fill: '#ffffff', backgroundColor: '#334155' });
            mouseBtn.setStyle({ fill: '#00ffff', backgroundColor: '#1e293b' });
        });
    }

    // 🚀 2. プレイヤー速度の設定 (＋ / ー)
    createPlayerSpeedSettings(centerX) {
        this.scene.add.text(centerX, 280, '■ プレイヤーの移動スピード', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const speedText = this.scene.add.text(centerX, 340, `${playerSpeed}`, {
            fontSize: '36px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff'
        }).setOrigin(0.5);

        const minusBtn = this.scene.add.text(centerX - 140, 340, ' ➖ ', {
            fontSize: '28px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#1e293b',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const plusBtn = this.scene.add.text(centerX + 140, 340, ' ➕ ', {
            fontSize: '28px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#1e293b',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // イベント設定
        minusBtn.on('pointerdown', () => {
            if (playerSpeed > 1) {
                setPlayerSpeed(playerSpeed - 1);
                speedText.setText(`${playerSpeed}`);
            }
        });

        plusBtn.on('pointerdown', () => {
            if (playerSpeed < 30) {
                setPlayerSpeed(playerSpeed + 1);
                speedText.setText(`${playerSpeed}`);
            }
        });
    }
}