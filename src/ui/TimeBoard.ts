class TimeBoard extends eui.Component
{
    // 组件
    bl_time: eui.BitmapLabel;       // 时间文本

    // 属性
    private _time: number;          // 倒计时

    constructor () { super(); }

    setTime ( time: number ): void
    {
        this._time = time;

        this._update();
    }

    // 开始倒计时
    start (): void
    {
        console.log( "开始倒计时！" );
    }

    stop (): void
    {
        console.log( "结束倒计时！" );
    }

    reset (): void
    {
        this._time = 0;

        this._update();
    }

    private _update (): void
    {
        this.bl_time.text = `${ this._time }`;
    }
}