
const GAP = 30;                 // 辅助线 点间距

const START_Y = 0;              // 开始画的Y坐标

const RES_POINT = "point_png";  // 白点资源
const POINT_RADIUS = 5;         // 原点半径m
/**
 * 辅助线生成工具
 */
class GuidLine
{
    private _group: egret.DisplayObjectContainer;    // 辅助线容器

    private _pool: eui.Image[];                       // 点对象池

    private _k: number;         // 辅助线 斜率
    private _b: number;         // 辅助线 常量
    private _angle: number;     // 辅助线角度 

    public left: number;      // 左边界
    public right: number;     // 右边界
    public top: number;       // 上边界
    public bottom: number;     // 下边家

    constructor ( group: eui.Group )
    {
        this._group = group;

        this._pool = [];

        this.left = group.x + df.RADIUS;
        this.top = group.y + df.RADIUS;
        this.right = group.x + group.width - df.RADIUS;
        this.bottom = group.y + group.height - df.RADIUS;

        this._extendPool();
    }

    // 显示
    show ( x1: number, y1: number, x2: number, y2: number, angle: number ): void
    {

        let k = Math.round( ( y1 - y2 ) / ( x1 - x2 ) * 100 ) / 100
        let b = Math.round( ( y1 - k * x1 ) * 100 ) / 100;
        this._k = k;
        this._b = b;
        this._angle = angle;
        this._update();
    }

    // 隐藏
    hide (): void
    {
        while ( this._group.numChildren )
            this._push( this._group.removeChildAt( 0 ) as eui.Image );
    }

    // 更细视图
    private _update (): void
    {
        let points = this._getPoints().reverse();
        let pointImg: eui.Image = null;

        let index = 0;
        while ( points.length ) {
            let { x, y } = points.pop();
            // 球体碰撞检测
            if ( core.word.checkGuidLineHit( { x, y } ) ) {
                break;
            }

            if ( index < this._group.numChildren ) {
                pointImg = this._group.getChildAt( index ) as eui.Image;
            }
            else {
                pointImg = this._pop();
                this._group.addChild( pointImg );
            }
            pointImg.x = x - this._group.x;
            pointImg.y = y - this._group.y;
            index++;
        }

        while ( index < this._group.numChildren ) {
            this._push( this._group.getChildAt( index ) as eui.Image );
        }
    }

    // 获取墙体碰撞点
    private _getHitPoint ( x: number, y: number, count: number = 3 ): { x: number, y: number }[]
    {
        // 判断是否与墙体碰撞
        let k = this._k;
        let b = this._b;
        let left = this.left,
            top = this.top,
            right = this.right,
            bottom = this.bottom;


        let points = [ { x, y } ];

        let nextX = 0,
            nextY = 0;

        let i = 0;
        let isHit = false;
        while ( i < count ) {
            // 左墙撞击
            if ( !isHit && x != left ) {
                nextX = left;
                nextY = k * nextX + b;
                if ( nextY >= top && nextY <= bottom ) {
                    isHit = true;
                }
            }
            // 上墙判断
            if ( !isHit && y != top ) {
                nextY = top;
                nextX = ( nextY - b ) / k;
                if ( nextX >= left && nextX <= right ) {
                    isHit = true;
                }
            }
            // 右墙判断
            if ( !isHit && x != right ) {
                nextX = right;
                nextY = k * nextX + b;
                if ( nextY >= top && nextY <= bottom ) {
                    isHit = true;
                }
            }
            // 下墙判断
            if ( !isHit && y != bottom ) {
                nextY = bottom;
                nextX = ( nextY - b ) / k;
                if ( nextX >= left && nextX <= right ) {
                    isHit = true;
                }
            }

            k = -k;
            b = nextY - k * nextX;

            x = nextX;
            y = nextY;
            points.push( { x, y } );

            isHit = false;
            i++;
        }
        return points;
    }

    // 获取两点之间的图片定位点
    private _getPoints ( count: number = 3 ): { x: number, y: number }[]
    {
        let k = this._k;
        let b = this._b;
        let angle = this._angle;
        // 两点之间的偏移
        let gap = 0;
        let gapY = Math.round( GAP * Math.cos( angle * Math.PI / 180 ) );
        // 点坐标
        let y = this.bottom;
        let x = ( y - b ) / k;
        // 点数
        let num = 0;
        let points = [];
        let hitPoints = this._getHitPoint( x, y, count );
        for ( let l = 0; l < hitPoints.length - 1; l++ ) {
            points.push( hitPoints[ l ] );
            // 取起始点
            x = hitPoints[ l ].x;
            y = hitPoints[ l ].y;
            // 平滑处理
            num = Math.floor( Math.abs( ( hitPoints[ l + 1 ].y - hitPoints[ l ].y ) / ( gapY ) ) );
            gap = Math.round( ( hitPoints[ l + 1 ].y - hitPoints[ l ].y ) / ( num + 1 ) );
            // gap = hitPoints[ l + 1 ].y > hitPoints[ l ].y ? gapY : -gapY;
            // 偏移点计算
            for ( let count = 0; count < num; count++ ) {
                y = y + gap;
                x = ( y - b ) / k;
                points.push( { x, y } );
            }
            k = -k;
            b = hitPoints[ l + 1 ].y - k * hitPoints[ l + 1 ].x;
        }
        return points;
    }

    // 弹出
    private _pop (): eui.Image
    {
        if ( this._pool.length <= 0 )
            this._extendPool();
        return this._pool.pop();
    }

    // 扩容
    private _extendPool (): void
    {
        for ( let i = 0; i < 8; i++ ) {
            let point = new eui.Image( RES_POINT );
            point.anchorOffsetX = POINT_RADIUS;
            point.anchorOffsetY = POINT_RADIUS;
            this._pool.push( point );
        }
    }

    private _push ( point: eui.Image ): void
    {
        if ( point.parent )
            point.parent.removeChild( point );
        this._pool.push( point );
    }

    private _reducePool (): void
    {
        this._pool.length = Math.floor( this._pool.length / 2 );
    }
}