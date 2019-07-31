namespace core {
    /**
     * !!泡泡龙2D物理
     */
        
        // // 泡泡飞行的速度
        // export const BUBBLE_FLY_SPEED = 15;
        // // 泡泡半径
        // // export const RADIUS = 54;
    const RADIUS = df.RADIUS;
    // Y坐标补正
    const OFF_Y  = 7;
    
    // // 下一轮
    // export const EVT_NEXT_ROUND = "next_round";
    // // 下落动画x轴方向的最大速度
    // export const SPEED_X = 4;
    // // 下落动画y轴方向的最速度
    // export const SPEED_Y = 6;
    // //碰撞能量损耗系数
    // export const U = 0.65;
    // // 重力加速度
    // export const G = 1;
    
    export interface IModel {
        left?: number;
        right?: number;
        x?: number;
        y?: number;
        top?: number;
        bottom?: number;
        width?: number;
        height?: number;
        radius?: number;
        centerX?: number;
        centerY?: number;
    }
    
    export interface INodePosition {
        x: number,
        y: number
    };
    
    /**
     * 物理世界
     */
    class World {
        
        left: number   = 0;
        right: number  = 0;
        top: number    = 0;
        bottom: number = 0;
        
        offX: number;
        offY: number;
        
        constructor () {
        
        }
        
        // 添加舞台
        addStage ( target: IModel ): void {
            // this._left = target.x || 0;
            // this._right = ( target.width || RADIUS * MAX_COL * 2 ) + this._left;
            // this._top = target.y || 0;
            // this._bottom = ( target.height || RADIUS * MAX_ROW * 2 ) + this._top;
            
            this.left   = 0;
            this.right  = ( target.width || RADIUS * MAX_COL * 2 );
            this.top    = 0;
            this.bottom = ( target.height || RADIUS * MAX_ROW * 2 );
            
            this.offX = target.x || 0;
            this.offY = target.y || 0;
        }
        
        // 添加世界物体
        add ( target: IModel, row: number, col: number ): void {
            target.centerX = this.index2wX( row, col );
            target.centerY = this.index2wY( row, col );
            
            target.x = target.centerX;
            target.y = target.centerY;
        }
        
        // 获取物理世界边界
        getBoundary (): IModel {
            return {
                left: this.left,
                right: this.right,
                top: this.top,
                bottom: this.bottom
            }
        }
        
        // 获取泡泡模型
        getIndexModel ( row: number, col: number ): IModel {
            let centerX = this.index2wX( row, col );
            let centerY = this.index2wY( row, col );
            return { centerX, centerY };
        }
        // 获取中心点 X坐标
        index2wX ( row: number, col: number ): number {
            return ( row % 2 !== 0 ? RADIUS : 0 ) + col * RADIUS * 2 + RADIUS;
        }
        // 获取中心点的 Y坐标
        index2wY ( row: number, col?: number ): number {
            return row * ( RADIUS * 2 - OFF_Y ) + RADIUS;
        }
        
        // x坐标 舞台 => 世界
        g2wX ( x: number ): number { return x - this.offX; }
        // y坐标 舞台 => 世界
        g2wY ( y: number ): number { return y - this.offY; }
        
        // x坐标 世界 => 舞台
        w2gX ( x: number ): number { return x + this.offX;}
        // y坐 世界 => 舞台
        w2gY ( y: number ): number { return y + this.offY; }
        
        // 获取泡泡到的行索引
        getBubbleRow ( y: number ): number {
            return Math.floor( ( y - this.top - RADIUS ) / ( RADIUS * 2 - OFF_Y ) );
        }
        // 获取泡泡的列索引
        getBubbleCol ( x: number, row: number ): number {
            return Math.floor( ( x - this.left - RADIUS - ( RADIUS * 2 - OFF_Y ) ) / ( RADIUS * 2 ) );
        }
        
        //** ---------------------  -------------------------- */
        // 是否撞边墙
        isHitSideWall ( x: number ): boolean {
            let wx = this.g2wX( x );
            return this.right - wx <= RADIUS || wx - this.left <= RADIUS;
        }
        
        // 获取碰撞到的泡泡索引
        getHitBubbleIndex ( cur: IModel ): INodeIndex {
            let cols   = model.getCols();
            let maxRow = model.getMaxRow();
            
            let r1 = cur.radius ? cur.radius : RADIUS;  // 碰撞球体 半径
            let r2 = RADIUS;                            // 被碰撞球体 半径
            
            let x1 = this.g2wX( cur.x );                // 碰撞球体 x坐标
            let y1 = this.g2wY( cur.y );                // 碰撞球体 y坐标
            
            let x2 = 0;                                 // 被碰撞球体 X坐标
            let y2 = 0;                                 // 被碰撞球体 Y坐标
            
            let a2 = 0;                                 // 直角边 a
            let b2 = 0;                                 // 直角边 b
            let c2 = Math.pow( r1 + r2, 2 );       // 斜边 c
            
            for( let row = maxRow; row >= -1; row-- ) {
                y2   = this.index2wY( row, 0 );
                a2   = Math.pow( y1 - y2, 2 );
                cols = core.model.getCols( row );
                for( let col = 0; col < cols; col++ ) {
                    
                    if( model.getNodeVal( row, col ) === NodeType.NONE ) continue;
                    
                    x2 = this.index2wX( row, col );
                    b2 = Math.pow( x1 - x2, 2 );
                    
                    if( a2 + b2 <= c2 )
                        return { row, col };
                }
            }
            return null;
        }
        
        // 获取撞击后定位的泡泡坐标
        getFixedBubbleIndex ( cur: IModel, hitBubble: INodeIndex ): INodeIndex {
            // 获取撞击泡泡周围的泡泡
            let fixedIndex: INodeIndex = null;
            let nearByEmpty            = model.getNeighbors( hitBubble.row, hitBubble.col, EFilterType.EMPTY );
            
            if( nearByEmpty.length == 0 ) return fixedIndex;
            
            let x1 = this.g2wX( cur.x );    // 碰撞球体x坐标
            let y1 = this.g2wY( cur.y );    // 碰撞球体y坐标
            
            let x2 = 0;                     // 被碰撞球体 X坐标
            let y2 = 0;                     // 被碰撞球体 Y坐标
            
            let a2 = 0;                     // 直角边 a
            let b2 = 0;                     // 直角边 b
            
            let minD = 10000;               // 最小距离
            
            for( let i = 0; i < nearByEmpty.length; i++ ) {
                
                x2 = this.index2wX( nearByEmpty[ i ].row, nearByEmpty[ i ].col );
                y2 = this.index2wY( nearByEmpty[ i ].row, 0 );
                
                a2 = Math.pow( y1 - y2, 2 );
                b2 = Math.pow( x1 - x2, 2 );
                
                if( a2 + b2 > minD ) continue;
                
                minD       = a2 + b2;
                fixedIndex = nearByEmpty[ i ];
            }
            return fixedIndex;
        }
        
        // 检查辅助线与世界的碰撞
        checkGuidLineHit ( point: IModel ): boolean {
            let maxRow = model.getMaxRow();
            // point.radius = point.radius || RADIUS / 2;
            
            if( point.centerY > this.index2wY( maxRow, 0 ) + RADIUS ) return false;
            
            return this.getHitBubbleIndex( point ) !== null;
            
        }
    }
    
    export let word: World = new World();
}


