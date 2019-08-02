namespace game {
    /**
     * 控制器
     */
    export class GameHandler {
        private _gameView: GameView;
        private _angle: number;             // 发射角度
        
        private _guidLineHandler: ui.GuidLineHandler;     // 弹道辅助线
        private _arrow: ui.Arrow;           // 箭头
        
        // 状态属性
        private _isUseTool: boolean;        // 是否正在使用道具中
        private _onGuildLine: boolean;      // 是否开启导线
        private _onColor: boolean;          // 是否开启color
        
        constructor ( res: GameView ) {
            this._gameView = res;
            
            this._onGuildLine = false;
            
            this._initHandler();
            
        }
        
        private _initHandler (): void {
            this._arrow           = this._gameView.icon_arrow;
            this._guidLineHandler = new ui.GuidLineHandler( this._gameView.g_guidLine );
            
            this._gameView.btn_change.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnSwitch, this );
            this._gameView.g_tool.addEventListener( egret.TouchEvent.TOUCH_BEGIN, this._onTouchToolBegin, this );
            this._gameView.g_handle.addEventListener( egret.TouchEvent.TOUCH_BEGIN, this._onUserTouchBegin, this );
        }
        
        // 交换事件
        private _onBtnSwitch (): void {
            this._gameView.amSwitch();
        }
        
        // 道具触碰开启
        private _onTouchToolBegin ( evt: egret.Event ): void {
            const tool = evt.target as IToolItem;
            
            tool.icon_tool.scaleX = 1.1;
            tool.icon_tool.scaleY = 1.1;
            
            this._gameView.g_tool.addEventListener( egret.TouchEvent.TOUCH_END, this._onTouchToolEnd, this );
            this._gameView.g_tool.addEventListener( egret.TouchEvent.TOUCH_CANCEL, this._onTouchCancel, this );
            this._gameView.g_tool.addEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._onTouchCancel, this );
        }
        // 道具区域触碰
        private _onTouchToolEnd ( evt: egret.Event ): void {
            let tool = evt.target as IToolItem;
            switch( tool.name ) {
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
            this._gameView.useTool( tool );
            
            this._onTouchCancel( evt );
        }
        private _onTouchCancel ( evt: egret.Event ): void {
            const tool = evt.target as IToolItem;
            
            tool.icon_tool.scaleX = 1;
            tool.icon_tool.scaleY = 1;
            this._gameView.g_tool.removeEventListener( egret.TouchEvent.TOUCH_END, this._onTouchToolEnd, this );
            this._gameView.g_tool.removeEventListener( egret.TouchEvent.TOUCH_CANCEL, this._onTouchCancel, this );
            this._gameView.g_tool.removeEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._onTouchCancel, this );
        }
        
        /* ----------------------------  用户游戏操作 ----------------------------*/
        private _onUserTouchBegin ( evt: egret.TouchEvent ): void {
            // 游戏中不能触碰
            if( this._gameView.gameStatus !== df.EGameStatus.PLAYING ) return;
            // 发射状态不能触碰
            if( this._gameView.isShooting ) return;
            
            this._updateView( evt );
            
            this._gameView.g_handle.addEventListener( egret.TouchEvent.TOUCH_MOVE, this._updateView, this );
            this._gameView.g_handle.addEventListener( egret.TouchEvent.TOUCH_END, this._onUserTouchEnd, this );
            this._gameView.g_bubble.addEventListener( egret.TouchEvent.TOUCH_CANCEL, this._touchEnd, this );
            this._gameView.g_handle.addEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._touchEnd, this );
        }
        // 更新用户操作、视图更新
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
        // 用户操作结束、发射
        private _onUserTouchEnd (): void {
            this._gameView.startShooting( this._angle );
            
            // // 关闭导线
            this._onGuildLine = false;
            this._touchEnd();
        }
        // 用户操作取消、接触绑定
        private _touchEnd (): void {
            this._arrow.hide();
            this._guidLineHandler.hide();
            
            this._gameView.g_handle.removeEventListener( egret.TouchEvent.TOUCH_MOVE, this._updateView, this );
            this._gameView.g_handle.removeEventListener( egret.TouchEvent.TOUCH_END, this._onUserTouchEnd, this );
            this._gameView.g_bubble.removeEventListener( egret.TouchEvent.TOUCH_CANCEL, this._touchEnd, this );
            this._gameView.g_handle.removeEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._touchEnd, this );
        }
        
        clear (): void {
            this._gameView.btn_change.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnSwitch, this );
            this._gameView.g_tool.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchToolBegin, this );
            this._gameView.g_handle.removeEventListener( egret.TouchEvent.TOUCH_BEGIN, this._onUserTouchBegin, this );
        }
    }
    
    function getAngle ( x1: number, y1: number, x2: number, y2: number ): number {
        if( y2 >= y1 ) return 0;
        
        let a = x2 - x1;
        let b = Math.abs( y2 - y1 );
        
        return Math.atan( a / b ) * 180 / Math.PI;
    }
    
}