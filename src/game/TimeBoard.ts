namespace view {
    export class TimeBoard extends eui.Component {
        // 组件
        bl_time: eui.BitmapLabel;       // 时间文本
        
        // 属性
        private _time: number = -1;          // 倒计时
        get time () {return this._time; }
        set time ( value: number ) {
            if( this._time === value ) return;
            this._time = value;
            if( value < 0 ) return;
            this.bl_time.text = `${ this._time }`;
        }
        
        constructor () { super(); }
        
        setTime ( time: number ): void {
            this.time = time;
        }
        
        // 开始倒计时
        start (): void {
            console.log( '开始倒计时！' );
        }
        
        stop (): void {
            console.log( '结束倒计时！' );
        }
        
        reset (): void {
            this.time = 0;
        }
    }
}