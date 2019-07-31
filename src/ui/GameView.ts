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
    
    // 游戏属性
    private _lv: number;                    // 关卡等级
    private _lvData: ILVData;               // 关卡数据
    
    private _curBubble: ui.Bubble;          // 当前泡泡
    private _nextBubble: ui.Bubble;         // 下一个泡泡
    
    // private _hitIndex: core.INodeIndex;    // 击中的泡泡
    // private _fixedIndex: core.INodeIndex;  // 定位的泡泡
    
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
        this._bubbleMap       = [];
        this._droppingBubbles = [];
        
        core.word.addStage( this.g_bubble );
    }
    
    // 设置等级
    setLv ( lv: number ): void {
        if( this._lv == lv ) return;
        this._lv = lv;
        
        this._lvData = DataMrg.getIns().getLvDt( lv );
        
        if( this._lvData !== null ) {
            this._lvData.map[ -1 ] = df.B1;
            core.model.updateMap( this._lvData.map );
            
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
                    console.warn( '添加的跑跑跑不存在！' );
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
        
        const x = this._curBubble.x;
        if( core.word.isHitSideWall( this._curBubble.x ) ) {
            this._curBubble.speedX = -this._curBubble.speedX;
            // this._curBubble.x      = Math.max( Math.min( x, this.g_bubble.x + this.g_bubble.width - df.RADIUS ), this.g_bubble.x + df.RADIUS );
            if( this._curBubble.x < this.g_bubble.x + df.RADIUS )
                this._curBubble.x = this.g_bubble.x + df.RADIUS;
            else if( this._curBubble.x > this.g_bubble.x + this.g_bubble.width - df.RADIUS )
                this._curBubble.x = this.g_bubble.x + this.g_bubble.width - df.RADIUS;
        }
        
        // 判断撞击
        let hitIndex = core.word.getHitBubbleIndex( this._curBubble );
        if( hitIndex == null ) return;
        
        // 停止发射
        this._curBubble.stop();
        this.onShootingStop( hitIndex );
    }
    
    // 发射结束
    private onShootingStop ( hitIndex: core.INodeIndex ) {
        this.removeEventListener( egret.Event.ENTER_FRAME, this._amShooting, this );
        
        // 固定检查
        const fixedIndex = core.word.getFixedBubbleIndex( this._curBubble, hitIndex );
        if( fixedIndex ) {
            this._addBubble( fixedIndex.row, fixedIndex.col, this._curBubble );
        } else {
            console.error( '不存在可以定位泡泡的位置！！' );
            return;
        }
        
        // 连击检测
        const combos = core.model.getCombos( fixedIndex.row, fixedIndex.col );
        if( combos.length >= 3 ) {
            const noConnectNodes = core.model.getNoConnectNode( combos );
            const drops          = [ ...combos, ...noConnectNodes ];
            
            core.model.removeNode( drops );
            console.log( `移除泡泡：${ drops.length }` );
            this._startDrop( drops );
        }
        
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
    
    // 掉落前震动
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
    
    // 掉落
    // private _dropCount: number = 0;
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
                // bubble.stop();
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
