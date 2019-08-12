namespace view {
    
    interface ITimeApplication {
        onTimerEvent: Function,
        onTimeEnd: Function
    }
    
    // 时间控制器
    class TimeHandler {
        
        private _timer: egret.Timer;
        private _res: ITimeApplication;
        
        private _isTiming: boolean;     // 是否正在计时
        
        constructor () {
            this._isTiming = false;
            this._timer    = new egret.Timer( 1000 );
        }
        
        // 绑定执行者
        bindRes ( res: ITimeApplication ): void {
            if( this._res ) {
                if( this._timer.hasEventListener( egret.TimerEvent.TIMER ) )
                    this._timer.removeEventListener( egret.TimerEvent.TIMER, this._res.onTimerEvent, this._res );
                if( this._timer.hasEventListener( egret.TimerEvent.TIMER_COMPLETE ) )
                    this._timer.removeEventListener( egret.TimerEvent.TIMER_COMPLETE, this._res.onTimeEnd, this._res );
            }
            this._res = res;
            this.reset();
            this._timer.addEventListener( egret.TimerEvent.TIMER, this._res.onTimerEvent, this._res );
            this._timer.addEventListener( egret.TimerEvent.TIMER_COMPLETE, this._res.onTimeEnd, this._res );
        }
        
        reset (): void {
            this._isTiming = false;
            this._timer.reset();
            this._timer.repeatCount = dt.dataMrg.getLvTime();
        }
        
        star (): void {
            this._isTiming = true;
            this._timer.start();
        }
        
        stop (): void {
            if( !this._isTiming ) return;
            this._isTiming = false;
            this._timer.stop();
        }
    }
    
    export const timerHandler = new TimeHandler();
}