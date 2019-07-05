const SHOOT_START_POSITION = {
    x: 320,
    y: 985,
};

const NEXT_POSITION = {
    x: 205,
    y: 1010,
};

class MainGameScene extends eui.Component
{
    // 组件
    // border: eui.Image;       // 边框
    curtain: eui.Image;         // 闸
    dead_line: eui.Image;       // 死亡线
    icon_arrow: ui.Arrow;       // 箭头
    // 组件面板
    g_bubble: eui.Group;        // 泡泡的容器
    g_guidLine: eui.Group;      // 弹道容器
    g_handle: eui.Group;        // 控制区域
    btn_change: eui.Group;      // 切换按钮（无显示效果）
    time_board: TimeBoard;      // 计时器面板
    score_board: ScoreBoard;    // 计分板
    tool_board: eui.Component;  // 道具板

    // 游戏属性
    private _lv: number;                    // 关卡等级
    private _lvData: ILVData;               // 关卡数据

    private _curBubble: ui.Bubble;          // 当前泡泡
    private _nextBubble: ui.Bubble;         // 下一个泡泡
    private _hitBubble: core.INodeIndex;    // 击中的泡泡
    private _fixedBubble: core.INodeIndex;  // 定位的泡泡
    private _bubbleMap: ui.Bubble[][];      // 泡泡缓存
    private _droppingBubbles: ui.Bubble[];  // 正在掉落的泡泡

    gameStatus: df.EGameStatus;             // 游戏状态
    isShooting: boolean;                    // 是否正在发射中

    constructor ()
    {
        super();
        this.skinName = skins.MainGameScene;
        this._initProp();
    }

    protected childrenCreated ()
    {
        super.childrenCreated();
        this._initSkinPart();
    }

    // 初始化游戏属性
    private _initProp (): void
    {
        this.isShooting = false;
        this.gameStatus = df.EGameStatus.FREE;
        this._hitBubble = null;
        this._fixedBubble = null;
        this._lv = -1;
        this._lvData = null;

        core.word.addStage( this.g_bubble );
    }

    // 初始化游戏界面组件
    private _initSkinPart (): void
    {
        this._bubbleMap = [];
        this._droppingBubbles = [];
        this.btn_change.addEventListener( egret.TouchEvent.TOUCH_TAP, () =>
        {
            this.changeBubble();
        }, this );
    }

    // 设置等级
    setLv ( lv: number ): void
    {
        if ( this._lv == lv ) return;
        this._lv = lv;

        this._lvData = DataMrg.getIns().getLvDt( lv );

        if ( this._lvData === null ) {
            console.warn( `不能存在关卡【${ lv }】的游戏数据！` );
            return;
        }

        core.model.updateMap( this._lvData.map );

        this._updateTimeBoard();
        this._updateScoreBoard();
        this._updateBubbleGroup();
    }

    async gameStart ()
    {
        if ( this.gameStatus === df.EGameStatus.PLAYING ) return;
        this.gameStatus = df.EGameStatus.PLAYING;
        // 加载泡泡
        await this.loadBubble();
        // 开始倒计时
    }

    // 更新计分板
    private _updateScoreBoard (): void
    {
        this.score_board.setData( this._lv, this._lvData );
    }

    // 更新时间面板
    private _updateTimeBoard (): void
    {
        this.time_board.setTime( 60 );
        this.time_board.touchEnabled = true;
        this.time_board.addEventListener( egret.TouchEvent.TOUCH_TAP, () =>
        {
            this.gameStart();
        }, this );
    }

    // 更新泡泡容器内的泡泡 
    private _updateBubbleGroup (): void
    {
        // 静态泡泡初始化
        let rows = core.model.getRows();
        let cols = core.model.getCols();

        let bubble: ui.Bubble = null;
        let bubbleArr: ui.Bubble[][] = [];
        for ( let row = 0; row < rows; row++ ) {
            bubbleArr[ row ] = [];
            for ( let col = 0; col < cols; col++ ) {
                bubble = ui.BubblePool.getIns().createBubble( core.model.getNodeVal( row, col ) );

                bubbleArr[ row ][ col ] = bubble;

                this._addBubble( row, col, bubble )
            }
        }
        this.setChildIndex( this.curtain, 999 );
    }

    // 动画：上弹
    async loadBubble ()
    {
        core.model.loadNode();
        // 不存在当前的泡泡
        // 创建一个
        if ( !this._nextBubble ) {
            this._nextBubble = ui.BubblePool.getIns().createBubble( core.model.getCurNodeVal() );
            this.addChild( this._nextBubble );
            this._nextBubble.x = NEXT_POSITION.x;
            this._nextBubble.y = NEXT_POSITION.y;
        }
        await new Promise( resolve =>
        {
            egret.Tween.get( this._nextBubble ).to( {
                x: SHOOT_START_POSITION.x,
                y: SHOOT_START_POSITION.y,
            }, 250 ).wait( 100 ).call( resolve );
        } );
        // 更换位置
        this._curBubble = this._nextBubble;
        this._nextBubble = null;

        if ( !this._nextBubble ) {
            this._nextBubble = ui.BubblePool.getIns().createBubble( core.model.getNextNodeVal() );
            this.addChild( this._nextBubble );
            this._nextBubble.x = NEXT_POSITION.x;
            this._nextBubble.y = NEXT_POSITION.y;
        }
        this.icon_arrow.setValue( core.model.getCurNodeVal() );
    }

    // 动画： 更换泡泡
    async changeBubble ()
    {
        let self = this;
        if ( self.isShooting ) return;
        self.isShooting = true;

        core.model.loadNode();
        if ( !self._curBubble || !self._nextBubble ) return;
        let cur2next = new Promise( resolve =>
        {
            self.setChildIndex( self._curBubble, 200 );
            egret.Tween.get( self._curBubble ).to( {
                x: NEXT_POSITION.x,
                y: NEXT_POSITION.y,
            }, 300 ).call( resolve );
        } );
        let next2cur = new Promise( resolve =>
        {
            self.setChildIndex( self._nextBubble, 201 );
            egret.Tween.get( self._nextBubble ).to( {
                x: SHOOT_START_POSITION.x,
                y: SHOOT_START_POSITION.y,
            }, 250 ).call( resolve );
        } );

        await Promise.all( [ next2cur, cur2next ] );

        let temp = self._curBubble;
        self._curBubble = self._nextBubble;
        self._nextBubble = temp;

        core.model.changeNext2Cur();
        self.icon_arrow.setValue( core.model.getCurNodeVal() );
        self.isShooting = false;
    }

    // 开始发射动画
    startShooting ( angle: number ): void
    {
        this.isShooting = true;
        this._curBubble.setAngle( angle );
        this.addEventListener( egret.Event.ENTER_FRAME, this._onShooting, this );
    }

    // 发射开始过程
    private _onShooting ( evt: egret.Event )
    {
        // 速度运动
        this._curBubble.x += this._curBubble.speedX;
        this._curBubble.y += this._curBubble.speedY;

        if ( core.word.isHitSideWall( this._curBubble.x ) ) {
            this._curBubble.speedX = -this._curBubble.speedX;
            if ( this._curBubble.x < this.g_bubble.x + df.RADIUS )
                this._curBubble.x = this.g_bubble.x + df.RADIUS;
            else if ( this._curBubble.x > this.g_bubble.x + this.g_bubble.width - df.RADIUS )
                this._curBubble.x = this.g_bubble.x + this.g_bubble.width - df.RADIUS;
        }

        // 判断撞击
        this._hitBubble = core.word.getHitBubbleIndex( this._curBubble );

        if ( this._hitBubble == null ) return

        this.stopShooting();
    }

    // 发射结束
    private stopShooting ()
    {
        this.removeEventListener( egret.Event.ENTER_FRAME, this._onShooting, this );

        this._curBubble.stop();

        this._fixedCheck( this._hitBubble );

        if ( !this._fixedBubble ) return;
        this._comboCheck( this._fixedBubble );

        this.loadBubble();
        this.isShooting = false;
    }

    private _fixedCheck ( hitBubble: core.INodeIndex ): void
    {
        let fixedBubble: core.INodeIndex;
        fixedBubble = core.word.getFixedBubbleIndex( this._curBubble, hitBubble );
        if ( fixedBubble === null ) {
            console.error( "不存在可以定位泡泡的位置！！" );
            return;
        }
        this._addBubble( fixedBubble.row, fixedBubble.col, this._curBubble );
        this._fixedBubble = fixedBubble;
        this._hitBubble = null;
        this._curBubble = null;
    }

    // 连击判断
    private _comboCheck ( fixedBubble: core.INodeIndex ): void
    {
        let combos = core.model.getCombos( fixedBubble.row, fixedBubble.col );
        if ( combos.length < 3 ) return;

        core.model.removeNode( combos );

        let noConnectNodes = core.model.getNoConnectNode();

        core.model.removeNode( noConnectNodes );
        this._startDrop( [ ...combos, ...noConnectNodes ] );
    }

    // 添加泡泡到容器
    private _addBubble ( row: number, col: number, bubble?: ui.Bubble ): void
    {
        if ( !this._bubbleMap[ row ] ) this._bubbleMap[ row ] = [];
        this._bubbleMap[ row ][ col ] = bubble;
        if ( !bubble ) return;
        // 添加到容器
        this.g_bubble.addChild( bubble );
        // 更新物理模型
        core.word.add( bubble, row, col );
        // 更新数据模型
        core.model.addNode( row, col, bubble.value );
    }

    private _startDrop ( drops: core.INodeIndex[] ): void
    {
        let cur: ui.Bubble = null;
        let curIndex: core.INodeIndex;
        while ( drops.length ) {
            curIndex = drops.pop();
            cur = this._bubbleMap[ curIndex.row ][ curIndex.col ];

            cur.speedX = Math.pow( -1, Math.ceil( Math.random() * 4 ) ) * ( df.SPEED_X + Math.random() * df.SPEED_X );
            cur.speedY = -df.SPEED_Y + Math.random() * df.SPEED_X;
            cur.g = df.G + Math.random();

            this._bubbleMap[ curIndex.row ][ curIndex.col ] = null;
            this._droppingBubbles.push( cur );
            this.g_bubble.addChild( cur );
        }
        this.addEventListener( egret.Event.ENTER_FRAME, this._onDrop, this );
    }

    // 掉落
    private _onDrop ( evt: egret.Event ): void
    {
        let count = 0;
        let self = this;
        let droppingBubbles = self._droppingBubbles;
        let bubble: ui.Bubble;
        for ( let i = 0; i < droppingBubbles.length; i++ ) {
            bubble = droppingBubbles[ i ];
            bubble.x = bubble.x + bubble.speedX;
            bubble.y = bubble.y + bubble.speedY;
            bubble.speedY += bubble.g;

            // 触底反弹
            if ( core.word.bottom - bubble.y <= df.RADIUS ) {
                bubble.y = core.word.bottom - df.RADIUS;
                bubble.speedY = -df.U * bubble.speedY;
            }

            // 移除屏幕就移除
            if ( core.word.left - bubble.x >= df.RADIUS || core.word.right - bubble.x <= -df.RADIUS )
                ui.BubblePool.getIns().recycleBubble( bubble );
            else
                droppingBubbles[ count++ ] = droppingBubbles[ i ];
        }
        // 移除多余的泡泡引用
        for ( ; count < droppingBubbles.length; count++ ) {
            droppingBubbles.pop();
        }
        // 全部结束则停止动画
        if ( droppingBubbles.length === 0 ) {
            self.removeEventListener( egret.Event.ENTER_FRAME, self._onDrop, self );
            console.log( "动画结束" );
        }
    }

    // 胜利检测
    private _checkWin (): boolean
    {

        return false;
    }

    // 失败检测
    private _checkLose (): boolean
    {

        return false;
    }

    // // 清空泡泡
    // private clearBubble ( fixedBubble: Bubble )
    // {
    //     let combos = this.getCombos( fixedBubble );
    //     // 判断是否需要进行动画
    //     if ( combos.length <= 2 ) {
    //         if ( this.checkLose() ) {
    //             console.log( "you lose" );
    //         }
    //         return;
    //     }
    //     let dropBubbles = this.getDropBubble( combos );
    //     this.dropBubble = this.dropBubble.concat( dropBubbles.map( bubble =>
    //     {
    //         bubble.speedX = Math.pow( -1, Math.ceil( Math.random() * 4 ) ) * SPEED_X + Math.random();
    //         bubble.speedY = -SPEED_Y;
    //         bubble.g = G + Math.random();
    //         this.bubbleMap.delete( `( ${ bubble.row }, ${ bubble.col } )` );
    //         return bubble;
    //     } ) );
    //     if ( !this.g_bubble.hasEventListener( egret.Event.ENTER_FRAME ) ) {
    //         this.g_bubble.addEventListener( egret.Event.ENTER_FRAME, this.onStarDrop, this );
    //     }
    //     else {
    //         console.warn( "已注册该事件了" );
    //     }
    //     if ( this.checkWin() ) {
    //         console.log( "you win" );
    //     }
    // }

    // // 开始掉落泡泡的动画
    // private onStarDrop (): void
    // {
    //     let i = 0;
    //     this.dropBubble.forEach( ( bubble, index ) =>
    //     {
    //         bubble.x = bubble.x + bubble.speedX;
    //         bubble.y = bubble.y + bubble.speedY;
    //         bubble.speedY = bubble.speedY + bubble.g;
    //         if ( bubble.y + bubble.height >= this.g_bubble.height ) {
    //             bubble.y = this.g_bubble.height - bubble.height;
    //             bubble.speedY = -U * bubble.speedY;
    //         }
    //         if ( bubble.x > -bubble.width && bubble.x < this.g_bubble.width ) {
    //             this.dropBubble[ i ] = this.dropBubble[ index ];
    //             i++;
    //         }
    //         else {
    //             if ( bubble.parent ) {
    //                 this.g_bubble.removeChild( bubble );
    //             }
    //         }
    //     } );
    //     for ( ; i < this.dropBubble.length; i++ ) {
    //         this.dropBubble.pop();
    //     }
    //     if ( this.dropBubble.length === 0 ) {
    //         this.g_bubble.removeEventListener( egret.Event.ENTER_FRAME, this.onStarDrop, this );
    //     }
    // }

    // // 获取连击的泡泡
    // private getCombos ( fixedBubble: Bubble ): Bubble[]
    // {
    //     let root = fixedBubble,
    //         mapModel = getMapModel( this.table ),
    //         combos = [],
    //         stacks = [];
    //     mapModel[ root.row ][ root.col ] = 1;
    //     combos.push( root );
    //     stacks.push( root );
    //     while ( stacks.length ) {
    //         let target = stacks.pop();
    //         // 把相邻的不存在的bubble过滤掉
    //         let neighborhoods = target.neighborhoods.filter( bubbleIndex =>
    //         {
    //             return this.bubbleMap.has( `( ${ bubbleIndex[ 0 ] }, ${ bubbleIndex[ 1 ] } )` );
    //         } );
    //         for ( let i = 0; i < neighborhoods.length; ++i ) {
    //             let bubbleIndex = neighborhoods[ i ];
    //             if ( mapModel[ bubbleIndex[ 0 ] ][ bubbleIndex[ 1 ] ] ) continue;
    //             let nextBubble = this.bubbleMap.get( `( ${ bubbleIndex[ 0 ] }, ${ bubbleIndex[ 1 ] } )` );
    //             if ( nextBubble.value === root.value ) {
    //                 mapModel[ nextBubble.row ][ nextBubble.col ] = 1;
    //                 combos.push( nextBubble );
    //                 stacks.push( nextBubble );
    //             }
    //         }
    //     }
    //     return combos;
    // }

    // // 获取悬挂的泡泡
    // private getHangingBubble ()
    // {
    //     let bubbleMap = this.bubbleMap,
    //         mapModel = getMapModel( this.table ),
    //         col = 0,
    //         root = null,
    //         stacks = [];
    //     while ( col < MAX_COL ) {
    //         stacks = [];
    //         root = bubbleMap.get( `( ${ 0 }, ${ col } )` );
    //         if ( !root ) {
    //             col++;
    //             continue;
    //         }
    //         stacks.push( root );
    //         mapModel[ root.row ][ root.col ] = 1;
    //         while ( stacks.length ) {
    //             let target = stacks.pop(),
    //                 neighborhoods = target.neighborhoods.filter( bubbleIndex =>
    //                 {
    //                     return this.bubbleMap.has( `( ${ bubbleIndex[ 0 ] }, ${ bubbleIndex[ 1 ] } )` );
    //                 } );
    //             for ( let i = 0; i < neighborhoods.length; ++i ) {
    //                 let bubbleIndex = neighborhoods[ i ];
    //                 if ( mapModel[ bubbleIndex[ 0 ] ][ bubbleIndex[ 1 ] ] ) continue;
    //                 mapModel[ bubbleIndex[ 0 ] ][ bubbleIndex[ 1 ] ] = 1;
    //                 let nextBubble = bubbleMap.get( `( ${ bubbleIndex[ 0 ] }, ${ bubbleIndex[ 1 ] } )` );
    //                 stacks.push( nextBubble );
    //             }
    //         }
    //         col++;
    //     }
    //     return mapModel;
    // }

    // // 获取没有悬挂的泡泡
    // private getNoHangingBubble (): Bubble[]
    // {
    //     let noHands = [], // 没有悬挂的球
    //         hands = this.getHangingBubble();
    //     for ( let row = 0; row < hands.length; ++row ) {
    //         for ( let col = 0; col < hands[ row ].length; ++col ) {
    //             if ( this.table[ row ][ col ] > 0 && hands[ row ][ col ] === 0 ) {
    //                 noHands.push( this.bubbleMap.get( `( ${ row }, ${ col } )` ) );
    //             }
    //         }
    //     }
    //     return noHands;
    // }

    // // 获取将要坠落的泡泡
    // private getDropBubble ( combos: Bubble[] ): Bubble[]
    // {
    //     combos.forEach( bubble =>
    //     {
    //         this.bubbleMap.delete( `( ${ bubble.row }, ${ bubble.col } )` );
    //         this.table[ bubble.row ][ bubble.col ] = 0;
    //     } );
    //     let noHanging = this.getNoHangingBubble();
    //     noHanging.forEach( bubble =>
    //     {
    //         this.table[ bubble.row ][ bubble.col ] = 0;
    //         this.bubbleMap.delete( `( ${ bubble.row }, ${ bubble.col } )` );
    //     } );
    //     return combos.concat( noHanging );
    // }


    // // 检查赢
    // private checkWin ()
    // {
    //     let theLastRow = this.getLastBubbleRow();
    //     if ( ( theLastRow + 1 ) * ( this.curBubble.width - 6 ) <= 0 ) {
    //         return true;
    //     }
    //     return false;
    // }

    // // 检查输
    // private checkLose ()
    // {
    //     let theLastRow = this.getLastBubbleRow();
    //     let wallModel = this.getWallModel();
    //     if ( ( theLastRow + 1 ) * ( this.curBubble.width - 6 ) + wallModel.top > wallModel.bottom ) {
    //         return true;
    //     }
    //     return false;
    // }

    // // 获取最底层泡泡的行坐标
    // private getLastBubbleRow (): number
    // {
    //     let row = this.table.length - 1;
    //     for ( ; row >= 0; row-- ) {
    //         for ( let col = 0; col < this.table[ row ].length; col++ ) {
    //             if ( this.bubbleMap.has( `( ${ row }, ${ col } )` ) ) {
    //                 return row;
    //             }
    //         }
    //     }
    //     return row;
    // }
}

// // 获取数据模型
// function getMapModel ( table )
// {
//     let newTable = [];
//     let i = 0;
//     if ( table[ -1 ] ) {
//         i = -1;
//     }
//     for ( ; i < table.length; ++i ) {
//         newTable[ i ] = [];
//         for ( let j = 0; j < table[ i ].length; ++j ) {
//             newTable[ i ][ j ] = 0;
//         }
//     }
//     return newTable;
// }

