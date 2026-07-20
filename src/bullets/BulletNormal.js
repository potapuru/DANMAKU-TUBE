import Phaser from 'phaser';

export class BulletNormal extends Phaser.GameObjects.Arc {
    constructor(scene, x, y) {
        super(scene, x, y, 6, 0, 360, false, 0x00ff00);
        scene.add.existing(this);
        this.active = false;
    }
    update(time, delta) {}
}