/**
 * 控制器
 */
class GameHandler {
    private _res: GameView;
    private _angle: number;             // 发射角度
    
    private _guidLineHandler: ui.GuidLineHandler;     // 弹道辅助线
    private _arrow: ui.Arrow;           // 箭头
    
    private _onGuildLine: boolean;      // 是否开启导线
    
    constructor ( res: GameView ) {
        this._res = res;
        
        this._onGuildLine = false;
        
        this._initHandler();
        
    }
    
    private _initHandler (): void {
        this._arrow           = this._res.icon_arrow;
        this._guidLineHandler = new ui.GuidLineHandler( this._res.g_guidLine );
        
        // 玩家操作区事件绑定
        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_BEGIN, this._onUserTouchBegin, this );
        // 工具去操作时间绑定
        this._res.g_tool.touchChildren = true;
        // this._res.g_tool.touchEnabled = true;
        this._res.g_tool.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTool, this );
    }
    
    private _onUserTouchBegin ( evt: egret.TouchEvent ): void {
        // 游戏中不能触碰
        if( this._res.gameStatus !== df.EGameStatus.PLAYING ) return;
        // 发射状态不能触碰
        if( this._res.isShooting ) return;
        
        this._updateView( evt );
        
        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_MOVE, this._updateView, this );
        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_END, this._onUserTouchEnd, this );
        this._res.g_bubble.addEventListener( egret.TouchEvent.TOUCH_CANCEL, this._touchEnd, this );
        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._touchEnd, this );
    }
    
    private _updateView ( evt: egret.TouchEvent ): void {
        // 防溢出
        let x2 = Math.min( Math.max( evt.stageX, this._guidLineHandler.left ), this._guidLineHandler.right );
        let y2 = Math.min( Math.max( evt.stageY, this._guidLineHandler.top ), this._guidLineHandler.bottom );
        
        // 计算角度
        this._angle = getAngle( SHOOT_START_POSITION.x, SHOOT_START_POSITION.y, x2, y2 );
        // 显示箭头
        this._arrow.show( this._angle );
        // 显示导线
        if( this._onGuildLine )
            this._guidLineHandler.show( SHOOT_START_POSITION.x, SHOOT_START_POSITION.y, x2, y2, this._angle );
    }
    
    // 发射
    private _onUserTouchEnd (): void {
        this._res.startShooting( this._angle );
        
        // // 关闭导线
        this._onGuildLine = false;
        this._touchEnd();
    }
    
    // 触碰结束
    private _touchEnd (): void {
        this._arrow.hide();
        this._guidLineHandler.hide();
        
        this._res.g_handle.removeEventListener( egret.TouchEvent.TOUCH_MOVE, this._updateView, this );
        this._res.g_handle.removeEventListener( egret.TouchEvent.TOUCH_END, this._onUserTouchEnd, this );
        this._res.g_bubble.removeEventListener( egret.TouchEvent.TOUCH_CANCEL, this._touchEnd, this );
        this._res.g_handle.removeEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._touchEnd, this );
    }
    
    // 道具区域触碰
    private _onTouchTool ( evt: egret.Event ): void {
        switch( evt.target.name ) {
            case 'bomb':
                console.log( '更换炸弹' );
                break;
            case 'guid':
                this._onGuildLine = true;
                console.log( '开启导线' );
                break;
            case 'color':
                console.log( '使用colorBall' );
                break;
            case 'hummer':
                console.log( '使用锤子' );
                break;
            default:
                break;
        }
    }
}

function getAngle ( x1: number, y1: number, x2: number, y2: number ): number {
    if( y2 >= y1 ) return 0;
    
    let a = x2 - x1;
    let b = Math.abs( y2 - y1 );
    
    return Math.atan( a / b ) * 180 / Math.PI;
}
