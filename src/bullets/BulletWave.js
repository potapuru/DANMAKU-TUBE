import Phaser from 'phaser';
import { BulletConfig } from './BulletConfig.js';

export class BulletWave extends Phaser.GameObjects.Arc {
    // 💡【重要】後ろに customSpeed, customWaveAmplitude, customWaveFrequency を受け取るポケットを作りました
    constructor(scene, customPos, direction = 'down', customSpeed, customWaveAmplitude, customWaveFrequency) {
        const config = BulletConfig.wave;

        let startX = 0;
        let startY = 0;
        
        if (direction === 'down') {
            startX = customPos !== undefined ? customPos : scene.cameras.main.width / 2;
            startY = -20;
        } else if (direction === 'up') {
            startX = customPos !== undefined ? customPos : scene.cameras.main.width / 2;
            startY = scene.cameras.main.height + 20;
        } else if (direction === 'left') {
            startX = -20;
            startY = customPos !== undefined ? customPos : scene.cameras.main.height / 2;
        } else if (direction === 'right') {
            startX = scene.cameras.main.width + 20;
            startY = customPos !== undefined ? customPos : scene.cameras.main.height / 2;
        }

        super(scene, startX, startY, config.radius, 0, 360, false, config.color);
        
        scene.add.existing(this);
        this.direction = direction;

        // ⚙️ パラメータ設定
        this.baseX = startX;       
        this.baseY = startY;       
        this.timeCounter = 0;      
        
        // 💡【修正】データが送られてきていればそれを使い、なければデフォルト値(config)にします
        this.speed = customSpeed !== undefined ? customSpeed : config.speed;            
        this.waveAmplitude = customWaveAmplitude !== undefined ? customWaveAmplitude : config.waveAmplitude;   
        this.waveFrequency = customWaveFrequency !== undefined ? customWaveFrequency : config.waveFrequency; 

        this.damage = config.damage;
    }

    update() {
        this.timeCounter += 1;

        if (this.direction === 'down') {
            this.baseY += this.speed;
            this.y = this.baseY;
            this.x = this.baseX + Math.sin(this.timeCounter * this.waveFrequency) * this.waveAmplitude;
        } 
        else if (this.direction === 'up') {
            this.baseY -= this.speed;
            this.y = this.baseY;
            this.x = this.baseX + Math.sin(this.timeCounter * this.waveFrequency) * this.waveAmplitude;
        } 
        else if (this.direction === 'left') {
            this.baseX += this.speed;
            this.x = this.baseX;
            this.y = this.baseY + Math.sin(this.timeCounter * this.waveFrequency) * this.waveAmplitude;
        } 
        else if (this.direction === 'right') {
            this.baseX -= this.speed;
            this.x = this.baseX;
            this.y = this.baseY + Math.sin(this.timeCounter * this.waveFrequency) * this.waveAmplitude;
        }

        const margin = 50;
        if (this.x < -margin || 
            this.x > this.scene.cameras.main.width + margin ||
            this.y < -margin || 
            this.y > this.scene.cameras.main.height + margin) {
            this.destroy();
        }
    }
}