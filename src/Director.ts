/**
 * 控制器
 */
class Handler {
    private _res: MainGameScene;
    private _angle: number;             // 发射角度
    
    private _guidLine: GuidLine;        // 弹道辅助线
    private _arrow: ui.Arrow;           // 箭头
    
    constructor ( res: MainGameScene ) {
        this._res = res;
        
        this._arrow    = res.icon_arrow;
        this._guidLine = new GuidLine( res.g_guidLine );
        
        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_BEGIN, this._onTouchBegin, this );
    }
    
    private _onTouchBegin ( evt: egret.TouchEvent ): void {
        // 游戏中不能触碰
        if( this._res.gameStatus !== df.EGameStatus.PLAYING ) return;
        // 发射状态不能触碰
        if( this._res.isShooting ) return;
        
        this._updateView( evt );
        
        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_MOVE, this._updateView, this );
        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_END, this._onTouchEnd, this );
        this._res.g_bubble.addEventListener( egret.TouchEvent.TOUCH_CANCEL, this._touchEnd, this );
        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._touchEnd, this );
    }
    
    private _updateView ( evt: egret.TouchEvent ): void {
        // 防溢出
        let x2 = Math.min( Math.max( evt.stageX, this._guidLine.left ), this._guidLine.right );
        let y2 = Math.min( Math.max( evt.stageY, this._guidLine.top ), this._guidLine.bottom );
        
        this._angle = getAngle( SHOOT_START_POSITION.x, SHOOT_START_POSITION.y, x2, y2 );
        
        this._arrow.show( this._angle );
        this._guidLine.show( SHOOT_START_POSITION.x, SHOOT_START_POSITION.y, x2, y2, this._angle );
    }
    
    // 发射
    private _onTouchEnd ( evt: egret.TouchEvent ): void {
        this._res.startShooting( this._angle );
        this._touchEnd();
    }
    
    // 触碰结束
    private _touchEnd (): void {
        this._arrow.hide();
        this._guidLine.hide();
        
        this._res.g_handle.removeEventListener( egret.TouchEvent.TOUCH_MOVE, this._updateView, this );
        this._res.g_handle.removeEventListener( egret.TouchEvent.TOUCH_END, this._onTouchEnd, this );
        this._res.g_bubble.removeEventListener( egret.TouchEvent.TOUCH_CANCEL, this._touchEnd, this );
        this._res.g_handle.removeEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._touchEnd, this );
    }
}

function getAngle ( x1: number, y1: number, x2: number, y2: number ): number {
    if( y2 >= y1 ) return 0;
    
    let a = x2 - x1;
    let b = Math.abs( y2 - y1 );
    
    let angle = Math.atan( a / b ) * 180 / Math.PI;
    return angle;
}
