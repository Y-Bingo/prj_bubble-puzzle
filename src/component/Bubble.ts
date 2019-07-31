namespace ui {
    export class Bubble extends eui.Image {
        centerX: number;              // 定位x
        centerY: number;              // 定位y
        // 物理属性
        g: number;              // 重力加速度
        angle: number;          // 发射角度
        speedX: number;         // 速度偏移X
        speedY: number;         // 速度偏移Y
        _rotation: number;      // 发射旋转角度
        // shakeX: number;         // 震动x速度
        // 游戏属性
        row: number;            // 行坐标
        col: number;            // 纵坐标
        value: number;   // 泡泡值
        // // 组件
        // border: eui.Image;      // 外部
        // content: eui.Image;     // 内容
        
        constructor () {
            super();
            
            this.width         = df.RADIUS * 2;
            this.height        = df.RADIUS * 2;
            this.anchorOffsetX = df.RADIUS;
            this.anchorOffsetY = df.RADIUS;
            
            this.reset();
        }
        
        setValue ( val: number ) {
            if( this.value == val ) return;
            this.value = val;
            // this.source = null;
            this._updateRes();
        }
        
        setAngle ( angle: number ) {
            if( angle > df.MAX_ANGLE || angle < df.MIN_ANGLE ) return;
            this.angle = angle;
            if( angle < 35 ) {
                this.speedY = -df.BUBBLE_FLY_SPEED_Y * 1.4;
                this.speedX = Math.tan( angle * Math.PI / 180 ) * Math.abs( this.speedY );
            } else {
                this.speedY = -df.BUBBLE_FLY_SPEED_Y;
                this.speedX = Math.tan( angle * Math.PI / 180 ) * Math.abs( this.speedY );
            }
        }
        
        stop (): void {
            this.speedX   = 0;
            this.speedY   = 0;
            this.angle    = 0;
            this.g        = 0;
            this.rotation = 0;
        }
        
        private _updateRes (): void {
            let value   = this.value as number;
            this.source = df.BubbleResMap[ value ];
        }
        
        reset (): void {
            let self       = this;
            // 初始化属性
            self.g         = 0;
            self.angle     = 0;
            self.speedX    = 0;
            self.speedY    = 0;
            self._rotation = 0;
            self.row       = -1;
            self.col       = -1;
            
            self.centerX  = 0;
            self.centerY  = 0;
            self.x        = 0;
            self.y        = 0;
            self.rotation = 0;
            
            this.value = df.BubbleType.NONE;
        }
    }
}