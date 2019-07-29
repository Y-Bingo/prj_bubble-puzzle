namespace ui {
    export class Bubble extends eui.Image {
        // 物理属性
        g: number;              // 重力加速度
        angle: number;          // 发射角度
        speedX: number;         // 速度偏移X
        speedY: number;         // 速度偏移Y
        _rotation: number;      // 发射旋转角度
        // 游戏属性
        row: number;            // 行坐标
        col: number;            // 纵坐标
        value: df.BubbleType;   // 泡泡值
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
        
        setValue ( val: df.BubbleType ) {
            if( this.value == val ) return;
            this.value = val;
            // this.source = null;
            this._updateRes();
        }
        
        setAngle ( angle: number ) {
            if( angle > df.MAX_ANGLE || angle < df.MIN_ANGLE ) return;
            this.angle  = angle;
            this.speedY = -df.BUBBLE_FLY_SPEED_Y;
            this.speedX = Math.tan( angle * Math.PI / 180 ) * df.BUBBLE_FLY_SPEED_Y;
        }
        
        stop (): void {
            this.speedX   = 0;
            this.speedY   = 0;
            this.angle    = 0;
            this.g        = 0;
            this.rotation = 0;
        }
        
        private _updateRes (): void {
            let value  = this.value as number;
            this.source = df.BubbleResMap[ value ];
        }
        
        reset (): void {
            // 初始化属性
            this.g         = 0;
            this.angle     = 0;
            this.speedX    = 0;
            this.speedY    = 0;
            this._rotation = 0;
            this.row       = -1;
            this.col       = -1;
            
            this.value = df.BubbleType.NONE;
        }
    }
}