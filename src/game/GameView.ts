namespace view {
    
    export const SHOOT_START_POSITION = {
        x: 320,
        y: 985,
        rotation: 360
    };
    
    export const NEXT_POSITION = {
        x: 205,
        y: 1010,
        rotation: -360
    };
    
    export class GameView extends eui.Component implements view.IView {
        viewName: string         = 'GameView';
        viewType: view.EViewType = view.EViewType.PAGE;
        
        // 组件
        icon_arrow: ui.Arrow;       // 箭头
        // 组件面板
        g_bubble: eui.Group;        // 泡泡的容器
        g_guidLine: eui.Group;      // 弹道容器
        g_comboEffect: eui.Group;   // combo特效容器
        g_handle: eui.Group;        // 控制区域
        g_tool: eui.Component;      // 道具容器
        // 道具
        tool_hummer: IToolItem;
        tool_color: IToolItem;
        tool_bomb: IToolItem;
        tool_guid: IToolItem;
        
        gray_mask: eui.Rect;        // 灰色遮罩
        btn_pause: ui.ImageButton;  // 暂停按钮
        btn_begin: ui.ImageButton;  // 开始按钮
        btn_change: eui.Rect;       // 切换按钮（无显示效果）
        
        icon_ready: eui.Image;      // 准备
        
        time_board: ITimer;         // 计时器面板
        score_board: ScoreBoard;    // 计分板
        
        l_coin: eui.Label;          // 金币
        
        // 动画对象
        private _mcBomb: ui.MovieClip;      // 爆炸动画
        private _mcHummer: ui.MovieClip;    // 锤子动画
        
        // 游戏属性
        private _lvData: dt.ILVDt = null;     // 关卡数据
        
        private _curBubble: ui.Bubble  = null;          // 当前泡泡
        private _nextBubble: ui.Bubble = null;          // 下一个泡泡
        
        private _bubbleMap: ui.Bubble[][]     = [];     // 泡泡缓存
        private _droppingBubbles: ui.Bubble[] = [];     // 正在掉落的泡泡
        
        // 状态属性
        isShooting: boolean = false;                    // 是否正在发射中
        
        private _timeCount: number = 0;                 //  时间计时
        
        constructor () {
            super();
            this.skinName = skins.GamePage;
        }
        
        protected childrenCreated () {
            super.childrenCreated();
            
            gameHandler.bindRes( this );
            
            this._initMc();
            this.setChildIndex( this.btn_change, 200 );
            core.word.addStage( this.g_bubble );
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
        
        // ///////////////////////////  道具
        // 初始化道具面板
        private _initTool (): void {
            let { hummer, guid, bomb, color } = dt.dataMrg.getToolCount();
            this._setToolValue( this.tool_hummer, hummer );
            this._setToolValue( this.tool_color, color );
            this._setToolValue( this.tool_bomb, bomb );
            this._setToolValue( this.tool_guid, guid );
        }
        // 设置工具数量
        private _setToolValue ( tool: IToolItem, value: number ): void {
            tool.bl_num.text  = `${ value }`;
            tool.touchEnabled = value > 0;
            utils.SetImageGray( tool.icon_tool, value <= 0 );
        }
        // 使用道具
        useTool ( tool: IToolItem ): boolean {
            const self = this;
            if( !self._curBubble ) return false;
            switch( tool ) {
                case self.tool_hummer:
                    self._curBubble.setValue( df.BubbleType.HUMMER );
                    break;
                case self.tool_color:
                    self._curBubble.setValue( df.BubbleType.COLOR );
                    break;
                case self.tool_bomb:
                    self._curBubble.setValue( df.BubbleType.BOMB2 );
                    break;
                case self.tool_guid:
                default:
                    break;
            }
            self.icon_arrow.setValue( self._curBubble.value );
            self._setToolValue( tool, Number( tool.bl_num.text ) - 1 )
            
            dt.dataMrg.updateToolCount( tool.currentState, -1 );
            return true;
        }
        
        /******************** 游戏设置 ********************/
        // 设置关卡数据
        private _setLvData ( lv: number ): void {
            // this._lv     = lv;
            this._lvData = dt.dataMrg.getLvMap( lv );
            
            let map = JSON.parse( JSON.stringify( this._lvData.map ) );
            if( this._lvData !== null ) {
                map[ -1 ] = df.B1;
                core.model.setMap( map, this._lvData.types, this._lvData.next );
                
                this._timeCount = dt.dataMrg.getLvTime( lv )
                this._updateTimeBoard();
                this._updateScoreBoard();
                this._updateBubbleGroup();
                
            } else {
                console.warn( `不能存在关卡【${ lv }】的游戏数据！` );
            }
        }
        
        //
        // 显示
        onPreShow (): void {
            const self = this;
            
            self._reset();
            if( self.icon_ready.parent )
                self.icon_ready.parent.removeChild( self.icon_ready );
            if( !self.gray_mask.parent )
                self.addChild( self.gray_mask );
            if( !self.btn_begin.parent )
                self.addChild( self.btn_begin );
            
            if( dt.dataMrg.getGameModel() == df.EGameModel.LV ) {
                self._setLvData( dt.dataMrg.getCurLv() );
            }
            
            // 更新金币显示数量
            self.l_coin.text = `${ dt.dataMrg.getCoin() }`;
            // 更新道具显示数量
            self._initTool();
            
        }
        
        onPostClose (): void {
            this._reset();
            if( this.hasEventListener( egret.Event.ENTER_FRAME ) ) {
                // this.removeEventListener( egret.Event.ENTER_FRAME, this._amShake, this );
                this.removeEventListener( egret.Event.ENTER_FRAME, this._amDrop, this );
            }
        }
        
        // 重置
        private _reset (): void {
            const self = this;
            // 清空所有显示泡泡
            self.g_bubble.removeChildren();
            self._curBubble && self._curBubble.parent && self._curBubble.parent.removeChild( self._curBubble );
            self._nextBubble && self._nextBubble.parent && self._nextBubble.parent.removeChild( self._nextBubble );
            self._curBubble              = null;
            self._nextBubble             = null;
            self._bubbleMap.length       = 0;
            self._droppingBubbles.length = 0;
            self._lvData                 = null;
        }
        
        // 更新计分板
        private _updateScoreBoard (): void {
            this.score_board.setData( this._lvData );
        }
        
        // 更新时间面板
        private _updateTimeBoard (): void {
            let time = Math.max( this._timeCount, 0 );
            
            this.time_board.bl_time.text = `${ time }`;
        }
        
        /******************** 游戏控制 ********************/
        
        // 游戏开始
        async gameStart () {
            if( dt.dataMrg.getGameStatus() === df.EGameStatus.PLAYING ) return;
            
            if( this.btn_begin.parent )
                this.btn_begin.parent.removeChild( this.btn_begin );
            await this.amReadyGo();
            if( this.gray_mask.parent )
                this.gray_mask.parent.removeChild( this.gray_mask );
            
            // 创建第一个泡泡
            this._createNextBubble();
            
            // 加载泡泡
            await this.amLoad();
            // 更新游戏状态
            dt.dataMrg.setGameStatus( df.EGameStatus.PLAYING );
            // 开始倒计时
            timerHandler.star();
        }
        
        // 游戏停止
        onTimerEvent (): void {
            this._timeCount--;
            this._updateTimeBoard();
        }
        
        onTimeEnd (): void {
            this._timeCount = 0;
            if( this.hasEventListener( egret.Event.ENTER_FRAME ) ) {
                this.removeEventListener( egret.Event.ENTER_FRAME, this._amShooting, this );
            }
            this.timeOutResult();
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
        
        // 创建一个泡泡放置在next位置
        private _createNextBubble (): void {
            // 创建一个
            if( !this._nextBubble ) {
                const val          = core.model.getNextVal();
                this._nextBubble   = ui.bubblePool.createBubble( val );
                this._nextBubble.x = NEXT_POSITION.x;
                this._nextBubble.y = NEXT_POSITION.y;
                this.addChildAt( this._nextBubble, 11 );
            } else {
                console.error( 'next bubble没有清空！' );
            }
            // console.log( this.getChildIndex( this._nextBubble ), this.getChildIndex( this.btn_change ) );
        }
        // 添加泡泡到容器
        private _addBubble ( row: number, col: number, bubble: ui.Bubble ): void {
            if( !bubble ) {
                // console.warn( '添加的跑跑跑不存在！' );
                return;
            }
            
            if( !this._bubbleMap[ row ] ) {
                this._bubbleMap[ row ] = [];
            }
            
            // console.log( `增添泡泡：(${ row },${ col })【${ df.BubbleName[ bubble.value as number ] }】` );
            
            this._bubbleMap[ row ][ col ] = bubble;
            // 添加到容器
            this.g_bubble.addChild( bubble );
            // 更新物理模型
            core.word.add( bubble, row, col );
            // 更新数据模型
            core.model.addNode( row, col, bubble.value );
        }
        
        /******************** 动画 ********************/
        // ready动画
        amReadyGo () {
            const self = this;
            return new Promise( resolve => {
                
                if( !self.icon_ready.parent )
                    self.addChild( self.icon_ready );
                
                const tween = egret.Tween.get( self.icon_ready );
                for( let i = 3; i >= 0; i-- ) {
                    tween.call( () => {
                             self.icon_ready.source  = `readygo_${ i }_png`;
                             self.icon_ready.visible = true;
                         } )
                         .set( { scaleX: 2, scaleY: 2 } )
                         .to( { scaleX: 1, scaleY: 1 }, 500, egret.Ease.quartIn )
                         .wait( 150 )
                         .call( () => {
                             self.icon_ready.visible = false;
                         } )
                         .wait( 150 )
                }
                tween.call( () => {
                    egret.Tween.removeTweens( self.icon_ready );
                    
                    if( self.icon_ready.parent )
                        self.icon_ready.parent.removeChild( self.icon_ready );
                    
                    resolve();
                } );
            } );
        }
        
        // 动画: 待射区
        amBallRoll ( isNext2Cur: boolean ): Promise<any> {
            let self     = this;
            let position = isNext2Cur ? SHOOT_START_POSITION : NEXT_POSITION;
            let target   = isNext2Cur ? self._nextBubble : self._curBubble;
            // let zIndex   = isNext2Cur ? 101 : 100;
            
            if( target ) {
                return new Promise( resolve => {
                    egret.Tween
                         .get( target )
                         .to(
                             {
                                 x: position.x,
                                 y: position.y,
                                 rotation: position.rotation
                             },
                             250
                         )
                         .wait( 200 )
                         .call( resolve );
                } );
            }
            
            return Promise.resolve();
        }
        // 动画：上弹
        amLoad () {
            let self = this;
            
            if( this._curBubble ) {
                console.warn( '当前存在泡泡！' );
                this._curBubble = null;
            }
            
            return self.amBallRoll( true ).then( () => {
                self._curBubble  = self._nextBubble;
                self._nextBubble = null;
                
                self._createNextBubble();
                self.icon_arrow.setValue( self._curBubble.value );
                
                self.isShooting = false;
            } );
        }
        // 动画： 更换泡泡
        amSwitch () {
            let self = this;
            if( self.isShooting ) return;
            self.isShooting = true;
            
            // 执行动画
            return Promise.all( [ self.amBallRoll( true ), self.amBallRoll( false ) ] ).then( () => {
                let temp         = self._curBubble;
                self._curBubble  = self._nextBubble;
                self._nextBubble = temp;
                
                self.icon_arrow.setValue( self._curBubble.value );
                self.isShooting = false;
                
                self.swapChildren( this._curBubble, this._nextBubble );
                console.log( `【${ df.BubbleName[ this._nextBubble.value as number ] }】 <=> 【${ df.BubbleName[ this._curBubble.value as number ] }】` );
                
            } );
        }
        
        // 开始发射动画
        startShooting ( angle: number ): void {
            this.isShooting = true;
            this._curBubble.setAngle( angle );
            this.addEventListener( egret.Event.ENTER_FRAME, this._amShooting, this );
        }
        
        // 发射开始过程
        private _amShooting () {
            const self = this;
            // 速度运动
            self._curBubble.x += self._curBubble.speedX;
            self._curBubble.y += self._curBubble.speedY;
            self._curBubble.rotation += self._curBubble._rotation;
            
            const x = self._curBubble.x;
            if( core.word.isHitSideWall( self._curBubble.x ) ) {
                self._curBubble.speedX = -self._curBubble.speedX;
                if( self._curBubble.x < self.g_bubble.x + df.RADIUS )
                    self._curBubble.x = self.g_bubble.x + df.RADIUS;
                else if( this._curBubble.x > this.g_bubble.x + self.g_bubble.width - df.RADIUS )
                    self._curBubble.x = self.g_bubble.x + self.g_bubble.width - df.RADIUS;
            }
            this._hitCheck();
        }
        
        // 碰撞检测
        private _hitCheck (): void {
            // 判断撞击
            let hitIndex = core.word.getHitBubbleIndex( this._curBubble );
            if( !hitIndex ) return;
            // 停止动画
            this.removeEventListener( egret.Event.ENTER_FRAME, this._amShooting, this );
            
            // 判断是否为道具碰撞
            if( !( this._curBubble.value & df.TOOL_MASK ) ) {
                this._bubbleHit( hitIndex );
            } else {
                // 道具碰撞
                switch( this._curBubble.value ) {
                    case df.BubbleType.HUMMER:      // 锤子
                        this._hummerHit( hitIndex );
                        break;
                    case df.BubbleType.BOMB2:       // 炸弹
                        this._bombHit( hitIndex );
                        break;
                    case df.BubbleType.COLOR:       // color
                        this._colorHit( hitIndex );
                        break;
                    default:
                        break;
                }
            }
            this._resultCheck();
            
        }
        // 动画： 锤子碰撞
        private _hummerHit ( hitIndex: core.INodeIndex ): void {
            const self      = this;
            const hummer    = self._curBubble;
            const mcHummer  = self._mcHummer;
            const bubbleMap = self._bubbleMap;
            
            // 溢出屏幕处理
            if( hitIndex.row < 0 ) {
                core.word.add( hummer, hitIndex.row, hitIndex.col );
                hummer.visible = false;
                this._startDrop( [ hitIndex ], false );
                return;
            }
            
            const wx = core.word.w2gX( core.word.index2wX( hitIndex.row, hitIndex.col ) );
            const wy = core.word.w2gY( core.word.index2wY( hitIndex.row, hitIndex.col ) );
            
            // 计算将要掉落的球
            const noConnectNodes = core.model.getNoConnectNode( [ hitIndex ] );
            const drops          = [ hitIndex, ...noConnectNodes ];
            
            // 定位
            hummer.x   = wx;
            hummer.y   = wy;
            mcHummer.x = wx;
            mcHummer.y = wy;
            
            // 更新数据
            core.model.removeNodes( drops );
            
            // 动画回调
            const rmCall   = () => {
                ui.bubblePool.recycleBubble( hummer );
            };
            const amCall   = () => {
                if( hitIndex.row < 0 ) return;
                bubbleMap[ hitIndex.row ][ hitIndex.col ].visible = false;
                this._startDrop( drops, false );
            };
            const playCall = () => {
                self.removeChild( mcHummer );
                mcHummer.unbindFrameEvent( 1 );
                mcHummer.unbindFrameEvent( 3 );
                // console.log( wx, wy, hitIndex );
            };
            
            // 动画
            self.addChild( mcHummer );
            mcHummer.bindFrameEvent( 1, rmCall );
            mcHummer.bindFrameEvent( 3, amCall );
            mcHummer.play( playCall );
        }
        // 动画：炸弹碰撞
        private _bombHit ( hitIndex: core.INodeIndex ): void {
            const self           = this;
            const bomb           = self._curBubble;
            const mcBomb         = self._mcBomb;
            const bubbleMap      = self._bubbleMap;
            // 定位
            const { row, col }   = core.word.getFixedBubbleIndex( bomb, hitIndex );
            const wx             = core.word.w2gX( core.word.index2wX( row, col ) );
            const wy             = core.word.w2gY( core.word.index2wY( row, col ) );
            // 被破坏的泡泡
            const rmBubble       = core.model.getNeighbors( row, col, core.EFilterType.FILLED );
            const noConnectNodes = core.model.getNoConnectNode( rmBubble );
            const drops          = [ ...rmBubble, ...noConnectNodes ];
            core.model.removeNodes( drops );
            
            bomb.x   = wx;
            bomb.y   = wy;
            mcBomb.x = wx;
            mcBomb.y = wy;
            
            // 动画回调
            const rmCall   = () => {
                ui.bubblePool.recycleBubble( bomb );
            };
            const amCall   = () => {
                for( let i = 0; i < rmBubble.length; i++ ) {
                    let { row, col }                = rmBubble[ i ];
                    bubbleMap[ row ][ col ].visible = false;
                }
                this._startDrop( drops, false );
            };
            const playCall = () => {
                self.removeChild( mcBomb );
                mcBomb.unbindFrameEvent( 2 );
                mcBomb.unbindFrameEvent( 5 );
            };
            
            self.addChild( mcBomb );
            mcBomb.bindFrameEvent( 2, rmCall );
            mcBomb.bindFrameEvent( 3, amCall );
            mcBomb.play( playCall );
        }
        // 动画： 彩球碰撞
        private _colorHit ( hitIndex: core.INodeIndex ): void {
            const self  = this;
            const color = self._curBubble;
            
            // 定位
            const { row, col } = core.word.getFixedBubbleIndex( color, hitIndex );
            this._addBubble( row, col, this._curBubble );
            
            // 周边连击检测
            const neighbors = core.model.getNeighbors( row, col, core.EFilterType.FILLED );
            const types     = core.model.getTypes( neighbors );
            const combos    = [ { row, col } ];
            const combosMap = core.model.getCombos( row, col, types );
            // 过滤不符合条件的连击
            for( let type in combosMap ) {
                if( combosMap.hasOwnProperty( type ) && combosMap[ type ].length >= 3 ) {
                    combosMap[ type ].shift();
                    Array.prototype.push.apply( combos, combosMap[ type ] );
                }
            }
            
            gameHandler.showCombo( combos.length, new egret.Point( this._curBubble.x, this._curBubble.y ) );
            if( combos.length >= 3 ) {
                // 满足掉落条件
                const noConnectNodes = core.model.getNoConnectNode( combos );
                const drops          = [ ...combos, ...noConnectNodes ];
                
                core.model.removeNodes( drops );
                // 更新积分
                self.score_board.onProgress( self.countCombos( combos.length, drops.length ) );
                
                this._startDrop( drops );
            } else {
                // 不满足掉落条件 ：变成撞击的泡泡颜色
                let hitValue = core.model.getNodeVal( hitIndex.row, hitIndex.col );
                if( hitValue == df.BubbleType.ALPHA )
                    hitValue = core.model.createNode();
                color.setValue( hitValue );
                core.model.addNode( row, col, hitValue );
            }
        }
        // 普通泡泡碰撞
        private _bubbleHit ( hitIndex: core.INodeIndex ) {
            const self         = this;
            const bubble       = self._curBubble;
            // 定位
            const { row, col } = core.word.getFixedBubbleIndex( bubble, hitIndex );
            
            this._addBubble( row, col, this._curBubble );
            
            // 连击检测
            const combos = core.model.getCombos( row, col )[ this._curBubble.value ];
            gameHandler.showCombo( combos.length, new egret.Point( this._curBubble.x, this._curBubble.y ) );
            if( combos.length < 3 ) return;
            
            const noConnectNodes = core.model.getNoConnectNode( combos );
            const drops          = [ ...combos, ...noConnectNodes ];
            core.model.removeNodes( drops );
            
            // 更新积分
            self.score_board.onProgress( self.countCombos( combos.length, drops.length ) );
            
            // 开始掉落动画
            this._startDrop( drops );
        }
        
        // 结果检查
        private _resultCheck (): void {
            // 胜利检测
            if( this.$checkWin() ) {
                this.winResult();
                return;
            }
            
            // 失败检测
            if( this.$checkLose() ) {
                this.loseResult();
                return;
            }
            
            this._curBubble = null;
            this.amLoad();
        }
        
        // 开始掉落
        private _startDrop ( drops: core.INodeIndex[], isShake: boolean = true ): void {
            let bubble: ui.Bubble         = null;
            let curIndex: core.INodeIndex = null;
            
            let len = drops.length;
            for( let i = 0; i < len; i++ ) {
                curIndex = drops[ i ];
                bubble   = this._bubbleMap[ curIndex.row ][ curIndex.col ];
                
                bubble.speedX = ( i % 2 ? -1 : 1 ) * ( df.SPEED_X + Math.random() * df.SPEED_X );
                bubble.speedY = isShake ? -df.SPEED_Y + Math.random() * df.SPEED_X / 2 : 0;
                bubble.g      = df.G + Math.random();
                
                this._bubbleMap[ curIndex.row ][ curIndex.col ] = null;
                this._droppingBubbles.push( bubble );
                this.g_bubble.addChild( bubble );
            }
            
            // 开启动画
            if( !isShake ) {
                // 开启掉落动画
                this.addEventListener( egret.Event.ENTER_FRAME, this._amDrop, this );
            } else {
                this.addEventListener( egret.Event.ENTER_FRAME, this._amShake, this );
            }
        }
        // 动画: 震动
        private _shakeCount: number = 0;     // 已震动次数
        private _amShake (): void {
            let self  = this;
            let drops = self._droppingBubbles;
            let bubble: ui.Bubble;
            
            // 震动
            if( self._shakeCount <= df.SHAKE_COUNT ) {
                self._shakeCount += 1;
                // 震动动画
                for( let i = 0; i < drops.length; i++ ) {
                    bubble = drops[ i ];
                    bubble.x += ( Math.random() * df.SHAKE_SPEED - df.SHAKE_SPEED / 2 );
                }
                return;
            } else {
                // 移除震动动画
                self.removeEventListener( egret.Event.ENTER_FRAME, self._amShake, self );
                self._shakeCount = 0;
            }
            
            // 开启掉落动画
            self.addEventListener( egret.Event.ENTER_FRAME, this._amDrop, this );
        }
        // 动画： 掉落
        private _amDrop (): void {
            let count             = 0;
            let self              = this;
            let drops             = self._droppingBubbles;
            let bubble: ui.Bubble = null;
            
            // 掉落
            for( let i = 0; i < drops.length; i++ ) {
                bubble   = drops[ i ];
                bubble.x = bubble.x + bubble.speedX;
                bubble.y = bubble.y + bubble.speedY;
                bubble.speedY += bubble.g;
                
                // 触底反弹
                if( core.word.bottom - bubble.y <= df.RADIUS ) {
                    bubble.y      = core.word.bottom - df.RADIUS;
                    bubble.speedY = -df.U * bubble.speedY;
                }
                
                // 跳出屏幕就移除
                if( self.g_bubble.x - bubble.x > df.RADIUS || bubble.x - ( self.g_bubble.x + self.g_bubble.width ) > df.RADIUS ) {
                    count++;
                }
            }
            // 全部结束则停止动画
            if( drops.length === count ) {
                self.removeEventListener( egret.Event.ENTER_FRAME, self._amDrop, self );
                for( let i = 0; i < drops.length; i++ ) {
                    ui.bubblePool.recycleBubble( drops[ i ] );
                }
                drops.length = 0;
            }
        }
        
        // 获得金币奖励动画
        private _amCoinBonus (): void {
        
        }
        
        /******************** 胜负检查  ********************/
        protected gameEnd ( isFailed: boolean = false ): void {
            timerHandler.stop();
            gameHandler.gameEnd();
            
            const self = this;
            
            if( !isFailed ) {
                const deltaCompletion = dt.dataMrg.updateLvCompletion( self.score_board.getUserCompletion() );
                dt.dataMrg.updateCoin( self.lvModelCoinBonus( deltaCompletion ) );
            }
            
            dt.dataMrg.updateLvMaxScore( self.score_board.getUserScore() );
            
            view.viewMrg.showPanel(
                'ResultPanel',
                { effectType: ui.BOUNCE_EN.IN },
                [ self.score_board.getUserScore(), self.score_board.getUserCompletion(), isFailed ]
            );
            
        }
        // 胜利检测
        protected $checkWin (): boolean {
            // 满分情况下
            if( this.score_board.getUserScore() === this._lvData.maxScore ) return true;
            
            // 没有泡泡的情况下
            return core.model.isEmpty();
        }
        
        protected winResult (): void {
            this.gameEnd();
        }
        
        // 失败检测
        protected $checkLose (): boolean {
            return core.model.isOverflow();
        }
        
        protected loseResult (): void {
            this.gameEnd( true );
        }
        
        // 超时判定
        protected timeOutResult (): void {
            this.gameEnd();
        }
        
        /******************** 算分规则  ********************/
        // 计算连击得分
        protected countCombos ( combosCount: number, dropsCount: number ): number {
            let baseScore = df.COMBOS_BONUS[ 0 ];
            for( let i = 0; i < df.COMBO_LV.length; i++ ) {
                if( combosCount < df.COMBO_LV[ i ] ) break;
                baseScore = df.COMBOS_BONUS[ i ];
            }
            return combosCount * baseScore + ( dropsCount - combosCount ) * baseScore / 2;
        }
        
        protected lvModelCoinBonus ( deltaCompletion: number ): number {
            return deltaCompletion * df.COMPLETION_CHANGE_COIN;
        }
        
        // 计算金币得分
        protected freeModelCoinBonus ( score: number ): number {
            return Math.floor( score / df.SCORE_CHANGE_COIN );
        }
    }
}