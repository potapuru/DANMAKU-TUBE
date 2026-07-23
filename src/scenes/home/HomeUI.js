export class HomeUI {
    constructor(scene) {
        this.scene = scene;
    }

    // UI要素をすべて生成して配置
    create() {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        this.createSettingButton(screenWidth - 170, 40);
        this.createTitle(centerX, centerY - 100);
        this.createStartButton(centerX, centerY + 60);
    }

    // ⚙️ 設定画面ボタン
    createSettingButton(x, y) {
        const settingButton = this.scene.add.text(x, y, '⚙️ SETTINGS', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            backgroundColor: '#1e293b',
            padding: { x: 15, y: 8 }
        }).setInteractive({ useHandCursor: true });

        settingButton.on('pointerover', () => settingButton.setStyle({ fill: '#00ffff', backgroundColor: '#334155' }));
        settingButton.on('pointerout', () => settingButton.setStyle({ fill: '#ffffff', backgroundColor: '#1e293b' }));
        settingButton.on('pointerdown', () => {
            this.scene.scene.start('SettingScene');
        });
    }

    // 👑 タイトルロゴ（ゆらゆら動くアニメーション付き）
    createTitle(x, y) {
        const titleText = this.scene.add.text(x, y, 'Danmaku Tube', { 
            fontSize: '56px', 
            fontFamily: 'Impact, Arial Black, sans-serif',
            fill: '#00ffff',
            stroke: '#ff00ff',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, fill: true }
        }).setOrigin(0.5).setPadding(10); 

        this.scene.tweens.add({
            targets: titleText,
            y: y - 15,
            duration: 1800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    // 🚀 ゲームスタートボタン（枠線アニメーション・シーン移動付き）
    createStartButton(x, y) {
        const startButton = this.scene.add.text(x, y, '👉 ゲームスタート 👈', { 
            fontSize: '32px', 
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#00ffff',
            backgroundColor: '#0f172a',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5);

        // ボタン外枠の動的描画
        const btnBorder = this.scene.add.graphics();
        const updateBtnBorder = () => {
            btnBorder.clear();
            btnBorder.lineStyle(3, 0x00ffff, 1);
            const bounds = startButton.getBounds();
            btnBorder.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
        };
        updateBtnBorder();

        // 拡大縮小アニメーション
        this.scene.tweens.add({
            targets: startButton,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            onUpdate: updateBtnBorder
        });

        // イベント設定
        startButton.setInteractive({ useHandCursor: true });
        startButton.on('pointerover', () => startButton.setStyle({ fill: '#ffff00', backgroundColor: '#1e293b' }));
        startButton.on('pointerout', () => startButton.setStyle({ fill: '#00ffff', backgroundColor: '#0f172a' }));
        startButton.on('pointerdown', () => {
            btnBorder.destroy();
            this.scene.scene.start('SelectScene');
        });
    }
}