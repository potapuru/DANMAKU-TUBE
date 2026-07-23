import Phaser from 'phaser';
import { BulletDown } from '../bullets/BulletDown.js';
import { BulletUp } from '../bullets/BulletUp.js';
import { BulletLeft } from '../bullets/BulletLeft.js';
import { BulletRight } from '../bullets/BulletRight.js';
import { BulletHoming } from '../bullets/BulletHoming.js';
import { BulletWave } from '../bullets/BulletWave.js';
import { BulletLaser } from '../bullets/BulletLaser.js';
import { BulletCircle } from '../bullets/BulletCircle.js';
import { getYoutubeCurrentTimeMS } from '../utils/helpers.js';

export class BossBase extends Phaser.GameObjects.Arc {
    constructor(scene, color = 0x8800ff) {
        const centerX = scene.cameras.main.width / 2;
        super(scene, centerX, 100, 40, 0, 360, false, color);
        
        scene.add.existing(this);
        this.setVisible(false);
        this.scene = scene;

        this.attackPattern = [];
        this.isAttacking = false; 
        
        this.lastConfirmedTime = 0; 
    }

    setPattern(rawPattern) {
        const fullPattern = [];
        rawPattern.forEach(data => {
            if (data.type === 'random_pack') {
                const interval = data.interval || 300;
                for (let time = data.start; time < data.end; time += interval) {
                    const randomX = Math.floor(Math.random() * (window.innerWidth - 200)) + 100;
                    fullPattern.push({ at: time, type: data.bulletType || 'down', pos: randomX });
                }
            } else if (data.type === 'loop_phrase') {
                const phrase = data.phrase || [];
                const times = data.times || [];
                times.forEach(startTime => {
                    phrase.forEach(note => {
                        fullPattern.push({
                            at: startTime + note.offset,
                            type: note.type,
                            pos: note.pos
                        });
                    });
                });
            } else {
                fullPattern.push(data);
            }
        });
        this.attackPattern = fullPattern;
    }

    // 🟢 1. 【手を付けるタイミング①】曲（攻撃）が「本当に新しく」始まったときだけ、変数を未発射（false）にする
    startAttack() {
        // 🛑 【最重要ガード】すでに曲が始まっているなら、二重にフラグに手を付けるのを絶対に禁止する
        if (this.isAttacking === true) return;

        if (this.attackPattern && this.attackPattern.length > 0) {
            this.attackPattern.forEach(data => {
                data.isFired = false;
            });
            this.attackPattern.sort((a, b) => a.at - b.at);
        }
        this.isAttacking = true; 
        this.lastConfirmedTime = 0;
    }

    // 🟢 2. 【手を付けるタイミング②】曲が終わったときだけ、変数をクリアする
    stopAttack() {
        this.isAttacking = false;
        if (this.attackPattern && this.attackPattern.length > 0) {
            this.attackPattern.forEach(data => {
                data.isFired = false; 
            });
        }
    }

    update(time, delta) {
        if (!this.isAttacking) return; 
        if (!this.scene.bullets) return;

        if (window.ytPlayer && typeof window.ytPlayer.getPlayerState === 'function') {
            if (window.ytPlayer.getPlayerState() !== 1) return;
        } else {
            return;
        }

        const rawTime = getYoutubeCurrentTimeMS();
        if (rawTime <= 0) return;

        const dt = delta !== undefined ? delta : 16.66;
        let currentTime = rawTime;

        if (this.lastConfirmedTime > 0) {
            // フリーズ等のバグが起きても、update内では変数（isFired）には絶対に手を付けない
            if (rawTime < this.lastConfirmedTime) {
                currentTime = rawTime;
            }
            else if (rawTime > this.lastConfirmedTime + 50) {
                currentTime = rawTime;
            } 
            else {
                const maxExpectedJump = dt + 300; 
                if (rawTime > this.lastConfirmedTime + maxExpectedJump) {
                    currentTime = this.lastConfirmedTime + Math.floor(dt);
                } else {
                    currentTime = rawTime;
                }
            }
        }
        this.lastConfirmedTime = currentTime;

        // 🎼 弾幕の発射チェック処理
        this.attackPattern.forEach(data => {
            // 🛑 🟢 3. 弾幕が発射される前に、変数を確認して「発射されていないこと」を絶対条件とする
            if (data.isFired === true) return;

            if (data.at <= currentTime) {
                // 🟢 4. 【手を付けるタイミング③】弾幕が発射された瞬間にだけ、変数を true にする
                data.isFired = true;

                let newBullet;
                
                // 💡 通常弾、ホーミング弾、ウェーブ弾の生成ロジックをパラメータ対応に拡張
                if (data.type === 'down') {
                    if (data.bulletType === 'homing') {
                        // 🎯 ホミング弾：第4引数に data.turnSpeed (追尾の強さ) を引き渡す
                        newBullet = new BulletHoming(this.scene, data.pos, -20, data.speed, data.turnSpeed);
                    } else if (data.bulletType === 'wave') {
                        // 🌊 ウェーブ弾：第4, 第5引数に 揺れ幅 と ウネウネ頻度 を引き渡す
                        newBullet = new BulletWave(this.scene, data.pos, 'down', data.speed, data.waveAmplitude, data.waveFrequency);
                    } else {
                        // 🟢 通常弾：第3引数にスピードを引き渡す
                        newBullet = new BulletDown(this.scene, data.pos, data.speed);
                    }
                } 
                else if (data.type === 'up') {
                    if (data.bulletType === 'homing') {
                        newBullet = new BulletHoming(this.scene, data.pos, this.scene.cameras.main.height + 20, data.speed, data.turnSpeed);
                    } else if (data.bulletType === 'wave') {
                        newBullet = new BulletWave(this.scene, data.pos, 'up', data.speed, data.waveAmplitude, data.waveFrequency);
                    } else {
                        newBullet = new BulletUp(this.scene, data.pos, data.speed);
                    }
                } 
                else if (data.type === 'left') {
                    if (data.bulletType === 'homing') {
                        newBullet = new BulletHoming(this.scene, -20, data.pos, data.speed, data.turnSpeed);
                    } else if (data.bulletType === 'wave') {
                        newBullet = new BulletWave(this.scene, data.pos, 'left', data.speed, data.waveAmplitude, data.waveFrequency);
                    } else {
                        newBullet = new BulletLeft(this.scene, data.pos, data.speed);
                    }
                } 
                else if (data.type === 'right') {
                    if (data.bulletType === 'homing') {
                        newBullet = new BulletHoming(this.scene, this.scene.cameras.main.width + 20, data.pos, data.speed, data.turnSpeed);
                    } else if (data.bulletType === 'wave') {
                        newBullet = new BulletWave(this.scene, data.pos, 'right', data.speed, data.waveAmplitude, data.waveFrequency);
                    } else {
                        newBullet = new BulletRight(this.scene, data.pos, data.speed);
                    }
                } else if (data.type === 'homing') {
                    newBullet = new BulletHoming(this.scene, data.pos, -20);
                } else if (data.type === 'wave_down') {
                    newBullet = new BulletWave(this.scene, data.pos, 'down');
                } else if (data.type === 'wave_up') {
                    newBullet = new BulletWave(this.scene, data.pos, 'up');
                } else if (data.type === 'wave_left') {
                    newBullet = new BulletWave(this.scene, data.pos, 'left');
                } else if (data.type === 'wave_right') {
                    newBullet = new BulletWave(this.scene, data.pos, 'right');
                } else if (data.type === 'laser_v') {
                    newBullet = new BulletLaser(this.scene, data.pos, 'vertical');
                } else if (data.type === 'laser_h') {
                    newBullet = new BulletLaser(this.scene, data.pos, 'horizontal');
                } else if (data.type === 'circle') {
                    newBullet = new BulletCircle(this.scene, data.pos, data.y, data.angle, data.speed);
                }
                
                if (newBullet) {
                    this.scene.bullets.push(newBullet);
                }
            }
        });

        if (this.scene.bullets) {
            this.scene.bullets.forEach(b => {
                if (b && b.active && typeof b.update === 'function') {
                    b.update(time, delta);
                }
            });
        }
    }
}