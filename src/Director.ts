/**
 * 控制器 
 */
class Handler
{
    private _res: MainGameScene;
    private _angle: number;             // 发射角度

    private _guidLine: GuidLine;        // 弹道辅助线
    private _arrow: ui.Arrow;           // 箭头

    constructor ( res: MainGameScene )
    {
        this._res = res;
        // this._gapX = egret.MainContext.instance.stage.stageWidth / 3 / MAX_ANGLE;

        this._arrow = res.icon_arrow;
        this._guidLine = new GuidLine( res.g_guidLine );

        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_BEGIN, this._onTouchBegin, this );
    }

    private _onTouchBegin ( evt: egret.TouchEvent ): void
    {
        if ( this._res.gameStatus !== df.EGameStatus.PLAYING ) return;
        if ( this._res.isShooting ) return;

        let x2 = Math.min( Math.max( evt.stageX, this._guidLine.left ), this._guidLine.right );
        let y2 = Math.min( Math.max( evt.stageY, this._guidLine.top ), this._guidLine.bottom );

        this._angle = getAngle( SHOOT_START_POSITION.x, SHOOT_START_POSITION.y, x2, y2 );

        this._arrow.show( this._angle );
        this._guidLine.show( SHOOT_START_POSITION.x, SHOOT_START_POSITION.y, x2, y2, this._angle );

        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_MOVE, this._onTouchMove, this );
        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_END, this._onTouchEnd, this );
        this._res.g_handle.addEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._onTouchRelease, this );
    }

    private _onTouchMove ( evt: egret.TouchEvent ): void
    {
        let x2 = Math.min( Math.max( evt.stageX, this._guidLine.left ), this._guidLine.right );
        let y2 = Math.min( Math.max( evt.stageY, this._guidLine.top ), this._guidLine.bottom );

        this._angle = getAngle( SHOOT_START_POSITION.x, SHOOT_START_POSITION.y, x2, y2 );

        this._arrow.show( this._angle );
        this._guidLine.show( SHOOT_START_POSITION.x, SHOOT_START_POSITION.y, x2, y2, this._angle );
    }

    // 发射
    private _onTouchEnd ( evt: egret.TouchEvent ): void
    {
        this._res.startShooting( this._angle );
        this._clearListener();
    }

    // 取消发射
    private _onTouchRelease ( evt: egret.TouchEvent ): void
    {
        console.warn( "outside" )
        this._clearListener();
    }

    private _clearListener (): void
    {
        // this._guidLine.hide();
        this._arrow.hide();

        this._res.g_handle.removeEventListener( egret.TouchEvent.TOUCH_MOVE, this._onTouchMove, this );
        this._res.g_handle.removeEventListener( egret.TouchEvent.TOUCH_END, this._onTouchEnd, this );
        this._res.g_handle.removeEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._onTouchRelease, this );
    }
}

function getAngle ( x1: number, y1: number, x2: number, y2: number ): number
{
    if ( y2 >= y1 ) return 0;

    let a = x2 - x1;
    let b = Math.abs( y2 - y1 );

    let angle = Math.round( Math.atan( a / b ) * 180 / Math.PI * 100 ) / 100;
    return angle;
}
// 	export class Director {

// 		private _res: Game;
// 		private _angle: number;
// 		private _startX: number;
// 		// 每旋转1角度所需要的操作距离
// 		private readonly _gapX: number;
// 		private _isShooting: boolean;

// 		constructor( res: Game ) {
// 			this._res = res;
// 			this._res.border.pixelHitTest = true;
// 			this._isShooting = false;
// 			this._gapX = egret.MainContext.instance.stage.stageWidth / 3 / MAX_ANGLE;
// 			this._res.bg.addEventListener( egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this );
// 			this._res.addEventListener( EVT_NEXT_ROUND, this.onNextRound, this );
// 			// this._res.nextBubble.addEventListener( egret.TouchEvent.TOUCH_TAP, this.onChange, this );
// 			// this._res.curBubble.addEventListener( egret.TouchEvent.TOUCH_TAP, this.onChange, this );
// 		}

// 		private onTouchBegin( evt: egret.TouchEvent ) {
// 			if ( this._isShooting ) return;
// 			this._angle = 0;
// 			this._startX = evt.stageX;
// 			this._res.curBubble.showArrow( 0 );
// 			this._res.bg.addEventListener( egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this );
// 			this._res.bg.addEventListener( egret.TouchEvent.TOUCH_END, this.onTouchEnd, this );
// 			this._res.bg.addEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchRelease, this );
// 		}

// 		private onTouchRelease() {
// 			this._res.curBubble.hideArrow();
// 			this._res.bg.removeEventListener( egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this );
// 			this._res.bg.removeEventListener( egret.TouchEvent.TOUCH_END, this.onTouchEnd, this );
// 			this._res.bg.removeEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchRelease, this );
// 		}

// 		private onTouchEnd( evt: egret.TouchEvent ) {
// 			this._res.curBubble.hideArrow();
// 			this._res.bg.removeEventListener( egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this );
// 			this._res.bg.removeEventListener( egret.TouchEvent.TOUCH_END, this.onTouchEnd, this );
// 			this._res.bg.removeEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchRelease, this );
// 			this._isShooting = true;
// 			this._res.startShooting();
// 		}

// 		private onTouchMove( evt: egret.TouchEvent ) {
// 			// 计算角度
// 			let curX = evt.stageX;
// 			let deltaX = curX - this._startX;
// 			let angle = Math.floor( deltaX / this._gapX );
// 			angle = Math.max( MIN_ANGLE, Math.min( MAX_ANGLE, angle ) );
// 			this._res.curBubble.showArrow( angle );
// 		}

// 		private onNextRound() {
// 			console.log( "下一轮" );
// 			this._isShooting = false;
// 		}

// 		private async onChange() {
// 			console.log( "更换泡泡" );
// 			this._isShooting = true;
// 			await this._res.changeBubble();
// 			this._isShooting = false;
// 		}
// 	}

// 	function radian2Angle( radian: number ) {
// 		return Math.max( Math.min( radian * 180 / Math.PI, MAX_ANGLE ), MIN_ANGLE );
// 	}
// }
