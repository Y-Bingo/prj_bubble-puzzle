namespace game {
    
    export class GameScene extends eui.Component {
        
        // 组件
        icon_arrow: ui.Arrow;       // 箭头
        // 组件面板
        g_bubble: eui.Group;        // 泡泡的容器
        g_guidLine: eui.Group;      // 弹道容器
        g_handle: eui.Group;        // 控制区域
        g_tool: eui.Component;      // 道具容器
        
        tool_hummer: IToolItem;
        tool_color: IToolItem;
        tool_bomb: IToolItem;
        tool_guid: IToolItem;
        
        btn_change: eui.Rect;       // 切换按钮（无显示效果）
        time_board: ITimer;         // 计时器面板
        
        score_board: ScoreBoard;    // 计分板
        
        // 动画对象
        protected _mcBomb: ui.MovieClip;  // 爆炸动画
        protected _mcHummer: ui.MovieClip;// 锤子动画
        
        // 游戏属性
        protected _lv: number;                    // 关卡等级
        protected _lvData: dt.ILVData;            // 关卡数据
        
        // private _curBubble: ui.Bubble;          // 当前泡泡
        // private _nextBubble: ui.Bubble;         // 下一个泡泡
        
        protected _bubbleMap: ui.Bubble[][];      // 泡泡缓存
        // private _droppingBubbles: ui.Bubble[];  // 正在掉落的泡泡
        
        // 状态属性
        gameStatus: df.EGameStatus;             // 游戏状态
        isShooting: boolean;                    // 是否正在发射中
        
        constructor () {
            super();
            this.skinName = skins.MainGameScene;
            this._initProp();
        }
        
        protected childrenCreated () {
            super.childrenCreated();
            console.log( 'childrenCreated' );
            this.$initSkinPart();
        }
        
        // 初始化游戏属性
        private _initProp (): void {
            this.isShooting = false;
            this.gameStatus = df.EGameStatus.FREE;
            this._lv        = -1;
            this._lvData    = null;
        }
        
        // 初始化游戏界面组件
        protected $initSkinPart (): void {
            this._bubbleMap       = [];
            // this._droppingBubbles = [];
            
            this._initMc();
            this._initTool();
            
            core.word.addStage( this.g_bubble );
            this.setChildIndex( this.btn_change, 200 );
        }
        
        // 初始化mc组件
        private _initMc (): void {
            // 动画组件
            this._mcBomb               = new ui.MovieClip( {
                sourceTemp: 'mc_bomb_%f_png',
                startFrame: 0,
                endFrame: 6,
                frameRate: 16
            } );
            this._mcBomb.anchorOffsetX = this._mcBomb.width / 2;
            this._mcBomb.anchorOffsetY = this._mcBomb.height / 2;
            
            this._mcHummer               = new ui.MovieClip( {
                sourceTemp: 'mc_hummer_%f_png',
                startFrame: 0,
                endFrame: 5,
                frameRate: 12
            } );
            this._mcHummer.anchorOffsetX = this._mcHummer.width / 2;
            this._mcHummer.anchorOffsetY = this._mcHummer.height / 2;
        }
        
        // 初始化道具面板
        private _initTool (): void {
            let { hummer, guid, bomb, color } = dt.dataMrg.getToolCount();
            this.tool_bomb.bl_num.text        = `${ bomb }`;
            this.tool_color.bl_num.text       = `${ color }`;
            this.tool_guid.bl_num.text        = `${ guid }`;
            this.tool_hummer.bl_num.text      = `${ hummer }`;
        }
        
        useTool (): void {
        
        }
        
        // 设置等级
        setLv ( lv: number ): void {
            if( this._lv == lv ) return;
            this._lv = lv;
            
            this._lvData = dt.dataMrg.getLvDt( lv );
            
            if( this._lvData !== null ) {
                this._lvData.map[ -1 ] = df.B1;
                core.model.setMap( this._lvData.map );
                core.model.setNext( this._lvData.next );
                
                this._updateTimeBoard();
                this._updateScoreBoard();
                this._updateBubbleGroup();
            } else {
                console.warn( `不能存在关卡【${ lv }】的游戏数据！` );
            }
        }
        
        protected async gameStart () {
            // if( this.gameStatus === df.EGameStatus.PLAYING ) return;
            // // 创建第一个泡泡
            // this._createNextBubble();
            // // 加载泡泡
            // await this.amLoad();
            // // 更新游戏状态
            // this.gameStatus = df.EGameStatus.PLAYING;
            // // 开始倒计时
        }
        
        // 更新计分板
        private _updateScoreBoard (): void {
            this.score_board.setData( this._lv, this._lvData );
        }
        
        // 更新时间面板
        private _updateTimeBoard (): void {
            this.time_board.bl_time.text = `${ this._lvData.time || df.GMAE_TIME }`;
            this.time_board.touchEnabled = true;
            this.time_board.addEventListener( egret.TouchEvent.TOUCH_TAP, () => {
                this.gameStart();
            }, this );
        }
        
        // 更新泡泡容器内的泡泡
        private _updateBubbleGroup (): void {
            // 静态泡泡初始化
            let rows = core.model.getRows();
            let cols = core.model.getCols();
            
            let bubble: ui.Bubble = null;
            for( let row = -1; row < rows; row++ ) {
                cols = core.model.getCols( row );
                for( let col = 0; col < cols; col++ ) {
                    bubble = ui.bubblePool.createBubble( core.model.getNodeVal( row, col ) );
                    if( !bubble ) {
                        continue;
                    }
                    if( !this._bubbleMap[ row ] ) {
                        this._bubbleMap[ row ] = [];
                    }
                    this._bubbleMap[ row ][ col ] = bubble;
                    // 添加到容器
                    this.g_bubble.addChild( bubble );
                    // 更新物理模型
                    core.word.add( bubble, row, col );
                }
            }
        }
        
        // // 创建一个泡泡放置在next位置
        // private _createNextBubble (): void {
        //     // 创建一个
        //     if( !this._nextBubble ) {
        //         const val          = core.model.getNextVal();
        //         this._nextBubble   = ui.bubblePool.createBubble( val );
        //         this._nextBubble.x = NEXT_POSITION.x;
        //         this._nextBubble.y = NEXT_POSITION.y;
        //         this.addChildAt( this._nextBubble, 11 );
        //     } else {
        //         console.error( 'next bubble没有清空！' );
        //     }
        //     console.log( this.getChildIndex( this._nextBubble ), this.getChildIndex( this.btn_change ) );
        // }
        //
        // // 动画: 待射区
        // amBallRoll ( isNext2Cur: boolean ): Promise<any> {
        //     let self     = this;
        //     let position = isNext2Cur ? SHOOT_START_POSITION : NEXT_POSITION;
        //     let target   = isNext2Cur ? self._nextBubble : self._curBubble;
        //     // let zIndex   = isNext2Cur ? 101 : 100;
        //
        //     if( target ) {
        //         // self.setChildIndex( target, zIndex );
        //         return new Promise( resolve => {
        //             egret.Tween
        //                  .get( target )
        //                  .to(
        //                      {
        //                          x: position.x,
        //                          y: position.y,
        //                          rotation: position.rotation
        //                      },
        //                      250
        //                  )
        //                  .wait( 200 )
        //                  .call( resolve );
        //         } );
        //     }
        //
        //     return Promise.resolve();
        // }
        //
        // // 动画：上弹
        // amLoad () {
        //     let self = this;
        //
        //     if( this._curBubble ) {
        //         console.warn( '当前存在泡泡！' );
        //         this._curBubble = null;
        //     }
        //     console.log( `上弹前：cur:【${ this._curBubble }】next:【${ df.BubbleName[ this._nextBubble.value as number ] }】` );
        //
        //     return self.amBallRoll( true ).then( () => {
        //         self._curBubble  = self._nextBubble;
        //         self._nextBubble = null;
        //
        //         self._createNextBubble();
        //         self.icon_arrow.setValue( self._curBubble.value );
        //
        //         console.log( `上弹后 cur:【${ df.BubbleName[ this._curBubble.value as number ] }】next:【${ df.BubbleName[ this._nextBubble.value as number ] }】` );
        //
        //         self.isShooting = false;
        //     } );
        // }
        //
        // // 动画： 更换泡泡
        // amSwitch () {
        //     let self = this;
        //     if( self.isShooting ) return;
        //     self.isShooting = true;
        //
        //     // 执行动画
        //     return Promise.all( [ self.amBallRoll( true ), self.amBallRoll( false ) ] ).then( () => {
        //         let temp         = self._curBubble;
        //         self._curBubble  = self._nextBubble;
        //         self._nextBubble = temp;
        //
        //         self.icon_arrow.setValue( self._curBubble.value );
        //         self.isShooting = false;
        //
        //         self.swapChildren( this._curBubble, this._nextBubble );
        //         console.log( `【${ df.BubbleName[ this._nextBubble.value as number ] }】 <=> 【${ df.BubbleName[ this._curBubble.value as number ] }】` );
        //
        //     } );
        // }
    }
}