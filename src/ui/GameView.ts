import MovieClip = ui.MovieClip;

const SHOOT_START_POSITION = {
    x: 320,
    y: 985,
    rotation: 360
};

const NEXT_POSITION = {
    x: 205,
    y: 1010,
    rotation: -360
};

class GameView extends eui.Component {
    // 组件
    icon_arrow: ui.Arrow;       // 箭头
    // 组件面板
    g_bubble: eui.Group;        // 泡泡的容器
    g_guidLine: eui.Group;      // 弹道容器
    g_handle: eui.Group;        // 控制区域
    g_tool: eui.Component;      // 道具容器
    
    btn_change: eui.Group;      // 切换按钮（无显示效果）
    time_board: TimeBoard;      // 计时器面板
    score_board: ScoreBoard;    // 计分板
    
    // 动画对象
    private _mcBomb: MovieClip;  // 爆炸动画
    private _mcHummer: MovieClip;// 锤子动画
    
    // 游戏属性
    private _lv: number;                    // 关卡等级
    private _lvData: dt.ILVData;               // 关卡数据
    
    private _curBubble: ui.Bubble;          // 当前泡泡
    private _nextBubble: ui.Bubble;         // 下一个泡泡
    
    private _bubbleMap: ui.Bubble[][];      // 泡泡缓存
    private _droppingBubbles: ui.Bubble[];  // 正在掉落的泡泡
    
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
        this._initSkinPart();
    }
    
    // 初始化游戏属性
    private _initProp (): void {
        this.isShooting = false;
        this.gameStatus = df.EGameStatus.FREE;
        this._lv        = -1;
        this._lvData    = null;
    }
    
    // 初始化游戏界面组件
    private _initSkinPart (): void {
        this._bubbleMap            = [];
        this._droppingBubbles      = [];
        // 动画组件
        this._mcBomb               = new MovieClip( {
            sourceTemp: 'mc_bomb_%f_png',
            startFrame: 0,
            endFrame: 6,
            frameRate: 16
        } );
        this._mcBomb.anchorOffsetX = this._mcBomb.width / 2;
        this._mcBomb.anchorOffsetY = this._mcBomb.height / 2;
        
        this._mcHummer               = new MovieClip( {
            sourceTemp: 'mc_hummer_%f_png',
            startFrame: 0,
            endFrame: 5,
            frameRate: 12
        } );
        this._mcHummer.anchorOffsetX = this._mcHummer.width / 2;
        this._mcHummer.anchorOffsetY = this._mcHummer.height / 2;
        
        core.word.addStage( this.g_bubble );
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
    
    async gameStart () {
        if( this.gameStatus === df.EGameStatus.PLAYING ) return;
        // 创建第一个泡泡
        this._createNextBubble();
        // 加载泡泡
        await this.amLoad();
        // 更新游戏状态
        this.gameStatus = df.EGameStatus.PLAYING;
        // 开始倒计时
    }
    
    // 更新计分板
    private _updateScoreBoard (): void {
        this.score_board.setData( this._lv, this._lvData );
    }
    
    // 更新时间面板
    private _updateTimeBoard (): void {
        this.time_board.setTime( 60 );
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
                
                console.log( `增添泡泡：(${ row },${ col })【${ df.BubbleName[ bubble.value as number ] }】` );
                
                this._bubbleMap[ row ][ col ] = bubble;
                // 添加到容器
                this.g_bubble.addChild( bubble );
                // 更新物理模型
                core.word.add( bubble, row, col );
                // this._addBubble( row, col, bubble );
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
            this.addChild( this._nextBubble );
        } else {
            console.error( 'next bubble没有清空！' );
        }
    }
    
    // 动画: 待射区
    amBallRoll ( isNext2Cur: boolean ): Promise<any> {
        let self     = this;
        let position = isNext2Cur ? SHOOT_START_POSITION : NEXT_POSITION;
        let target   = isNext2Cur ? self._nextBubble : self._curBubble;
        let zIndex   = isNext2Cur ? 201 : 200;
        
        if( target ) {
            self.setChildIndex( target, zIndex );
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
        console.log( `上弹前：cur:【${ this._curBubble }】next:【${ df.BubbleName[ this._nextBubble.value as number ] }】` );
        
        return self.amBallRoll( true ).then( () => {
            self._curBubble  = self._nextBubble;
            self._nextBubble = null;
            
            self._createNextBubble();
            self.icon_arrow.setValue( self._curBubble.value );
            
            console.log( `上弹后 cur:【${ df.BubbleName[ this._curBubble.value as number ] }】next:【${ df.BubbleName[ this._nextBubble.value as number ] }】` );
            
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
        // 速度运动
        this._curBubble.x += this._curBubble.speedX;
        this._curBubble.y += this._curBubble.speedY;
        this._curBubble.rotation += this._curBubble._rotation;
        
        const x = this._curBubble.x;
        if( core.word.isHitSideWall( this._curBubble.x ) ) {
            this._curBubble.speedX = -this._curBubble.speedX;
            // this._curBubble.x      = Math.max( Math.min( x, this.g_bubble.x + this.g_bubble.width - df.RADIUS ), this.g_bubble.x + df.RADIUS );
            if( this._curBubble.x < this.g_bubble.x + df.RADIUS )
                this._curBubble.x = this.g_bubble.x + df.RADIUS;
            else if( this._curBubble.x > this.g_bubble.x + this.g_bubble.width - df.RADIUS )
                this._curBubble.x = this.g_bubble.x + this.g_bubble.width - df.RADIUS;
        }
        
        this._hitCheck();
        // if( hitIndex == null ) return;
        
        // 开始停止
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
            this._resultCheck();
        }
    }
    // 动画： 锤子碰撞
    private _hummerHit ( hitIndex: core.INodeIndex ): void {
        const self      = this;
        const hummer    = self._curBubble;
        const mcHummer  = self._mcHummer;
        const bubbleMap = self._bubbleMap;
        
        const wx = core.word.w2gX( core.word.index2wX( hitIndex.row, hitIndex.col ) );
        const wy = core.word.w2gY( core.word.index2wY( hitIndex.row, hitIndex.col ) );
        
        // 定位
        hummer.x   = wx;
        hummer.y   = wy;
        mcHummer.x = wx;
        mcHummer.y = wy;
        
        // 更新数据
        core.model.removeNodes( [ hitIndex ] );
        
        // 动画
        self.addChild( mcHummer );
        mcHummer.bindFrameEvent( 1, () => {
            ui.bubblePool.recycleBubble( hummer );
        } );
        mcHummer.bindFrameEvent( 3, () => {
            ui.bubblePool.recycleBubble( bubbleMap[ hitIndex.row ][ hitIndex.col ] );
            bubbleMap[ hitIndex.row ][ hitIndex.col ] = null;
        } );
        mcHummer.play( () => {
            self.removeChild( mcHummer );
            mcHummer.unbindFrameEvent( 1 );
            mcHummer.unbindFrameEvent( 3 );
            console.log( wx, wy, hitIndex );
        } );
    }
    // 动画：炸弹碰撞
    private _bombHit ( hitIndex: core.INodeIndex ): void {
        const self         = this;
        const bomb         = self._curBubble;
        const mcBomb       = self._mcBomb;
        const bubbleMap    = self._bubbleMap;
        // 定位
        const { row, col } = core.word.getFixedBubbleIndex( bomb, hitIndex );
        const wx           = core.word.w2gX( core.word.index2wX( row, col ) );
        const wy           = core.word.w2gY( core.word.index2wY( row, col ) );
        // 定位周围的泡泡
        const neighbors    = core.model.getNeighbors( row, col, core.EFilterType.FILLED );
        
        bomb.x   = wx;
        bomb.y   = wy;
        mcBomb.x = wx;
        mcBomb.y = wy;
        
        // 更新数据
        core.model.removeNodes( neighbors );
        
        self.addChild( mcBomb );
        mcBomb.bindFrameEvent( 2, () => {
            ui.bubblePool.recycleBubble( bomb );
        } );
        mcBomb.bindFrameEvent( 3, () => {
            neighbors.forEach( ( { row, col } ) => {
                ui.bubblePool.recycleBubble( bubbleMap[ row ][ col ] );
                bubbleMap[ row ][ col ] = null;
            } );
        } );
        mcBomb.play( () => {
            self.removeChild( mcBomb );
            mcBomb.unbindFrameEvent( 2 );
            mcBomb.unbindFrameEvent( 5 );
        } );
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
        
        if( combos.length >= 3 ) {
            // 满足掉落条件
            const noConnectNodes = core.model.getNoConnectNode( combos );
            const drops          = [ ...combos, ...noConnectNodes ];
            
            core.model.removeNodes( drops );
            this._startDrop( drops );
        } else {
            // 不满足掉落条件 ：变成撞击的泡泡颜色
            let hitValue = core.model.getNodeVal( hitIndex.row, hitIndex.col );
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
        if( combos.length >= 3 ) {
            const noConnectNodes = core.model.getNoConnectNode( combos );
            const drops          = [ ...combos, ...noConnectNodes ];
            
            core.model.removeNodes( drops );
            this._startDrop( drops );
        }
        
        this._resultCheck();
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
    
    // 添加泡泡到容器
    private _addBubble ( row: number, col: number, bubble: ui.Bubble ): void {
        if( !bubble ) {
            // console.warn( '添加的跑跑跑不存在！' );
            return;
        }
        
        if( !this._bubbleMap[ row ] ) {
            this._bubbleMap[ row ] = [];
        }
        
        console.log( `增添泡泡：(${ row },${ col })【${ df.BubbleName[ bubble.value as number ] }】` );
        
        this._bubbleMap[ row ][ col ] = bubble;
        // 添加到容器
        this.g_bubble.addChild( bubble );
        // 更新物理模型
        core.word.add( bubble, row, col );
        // 更新数据模型
        core.model.addNode( row, col, bubble.value );
    }
    
    // 开始掉落
    private _startDrop ( drops: core.INodeIndex[] ): void {
        let bubble: ui.Bubble         = null;
        let curIndex: core.INodeIndex = null;
        
        let len = drops.length;
        for( let i = 0; i < len; i++ ) {
            curIndex = drops[ i ];
            bubble   = this._bubbleMap[ curIndex.row ][ curIndex.col ];
            
            bubble.speedX = ( i % 2 ? -1 : 1 ) * ( df.SPEED_X + Math.random() * df.SPEED_X );
            bubble.speedY = -df.SPEED_Y + Math.random() * df.SPEED_X / 2;
            bubble.g      = df.G + Math.random();
            
            this._bubbleMap[ curIndex.row ][ curIndex.col ] = null;
            this._droppingBubbles.push( bubble );
            this.g_bubble.addChild( bubble );
        }
        this.addEventListener( egret.Event.ENTER_FRAME, this._amShake, this );
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
    
    // 胜利检测
    protected $checkWin (): boolean {
        return core.model.isEmpty();
    }
    
    protected winResult (): void {
        console.log( '你赢了！' )
    }
    
    // 失败检测
    protected $checkLose (): boolean {
        return core.model.isOverflow();
    }
    
    protected loseResult (): void {
        console.log( '你输了！' );
    }
}
