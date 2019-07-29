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
    // border: eui.Image;       // 边框
    curtain: eui.Image;         // 闸
    dead_line: eui.Image;       // 死亡线
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
    private _hitBubble: core.INodeIndex;    // 击中的泡泡
    private _fixedBubble: core.INodeIndex;  // 定位的泡泡
    private _bubbleMap: ui.Bubble[][];      // 泡泡缓存
    private _droppingBubbles: ui.Bubble[];  // 正在掉落的泡泡
    
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
        this.isShooting   = false;
        this.gameStatus   = df.EGameStatus.FREE;
        this._hitBubble   = null;
        this._fixedBubble = null;
        this._lv          = -1;
        this._lvData      = null;
        
        core.word.addStage( this.g_bubble );
    }
    
    // 初始化游戏界面组件
    private _initSkinPart (): void {
        this._bubbleMap       = [];
        this._droppingBubbles = [];
        this.btn_change.addEventListener( egret.TouchEvent.TOUCH_TAP, () => {
            this.switchBubble();
        }, this );
    }
    
    // 设置等级
    setLv ( lv: number ): void {
        if( this._lv == lv ) return;
        this._lv = lv;
        
        this._lvData = DataMrg.getIns().getLvDt( lv );
        
        if( this._lvData === null ) {
            console.warn( `不能存在关卡【${ lv }】的游戏数据！` );
            return;
        }
        
        core.model.updateMap( this._lvData.map );
        
        this._updateTimeBoard();
        this._updateScoreBoard();
        this._updateBubbleGroup();
    }
    
    async gameStart () {
        if( this.gameStatus === df.EGameStatus.PLAYING ) return;
        this.gameStatus = df.EGameStatus.PLAYING;
        // 加载泡泡
        await this.loadBubble();
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
        
        let bubble: ui.Bubble        = null;
        let bubbleArr: ui.Bubble[][] = [];
        for( let row = 0; row < rows; row++ ) {
            bubbleArr[ row ] = [];
            for( let col = 0; col < cols; col++ ) {
                bubble = ui.BubblePool.getIns().createBubble( core.model.getNodeVal( row, col ) );
                
                bubbleArr[ row ][ col ] = bubble;
                
                this._addBubble( row, col, bubble )
            }
        }
    }
    
    // 创建一个泡泡放置在next位置
    private _createNextBubble (): void {
        // 创建一个
        if( !this._nextBubble ) {
            this._nextBubble = ui.BubblePool.getIns().createBubble( core.model.getNextVal() );
            this.addChild( this._nextBubble );
            this._nextBubble.x = NEXT_POSITION.x;
            this._nextBubble.y = NEXT_POSITION.y;
        }
    }
    
    // 动画: 待射区
    ballRoll ( isNext2Cur: boolean ) {
        let self     = this;
        let position = isNext2Cur ? SHOOT_START_POSITION : NEXT_POSITION;
        let target   = isNext2Cur ? self._nextBubble : self._curBubble;
        let zIndex   = isNext2Cur ? 201 : 200;
        
        let promise = Promise.resolve();
        
        if( target ) {
            self.setChildIndex( target, zIndex );
            return new Promise( resolve => {
                egret.Tween.get( target ).to( { ...position }, 300 ).wait( 100 ).call( () => {
                    console.log( '上弹动画完成！' );
                    resolve();
                } );
            } );
        }
        return Promise.resolve();
    }
    
    // 动画：上弹
    async loadBubble () {
        this._createNextBubble();
        await this.ballRoll( true );
        console.log( '创建下一个' );
        this._curBubble  = this._nextBubble;
        this._nextBubble = null;
        this._createNextBubble();
        this.icon_arrow.setValue( this._curBubble.value );
        this.isShooting = false;
    }
    
    // 动画： 更换泡泡
    async switchBubble () {
        let self = this;
        if( self.isShooting ) return;
        self.isShooting = true;
        
        // 执行动画
        await Promise.all( [ self.ballRoll( true ), self.ballRoll( false ) ] );
        
        console.log( '交换动画完成！' );
        let temp         = self._curBubble;
        self._curBubble  = self._nextBubble;
        self._nextBubble = temp;
        
        self.icon_arrow.setValue( self._curBubble.value );
        self.isShooting = false;
    }
    
    // 开始发射动画
    startShooting ( angle: number ): void {
        this.isShooting = true;
        this._curBubble.setAngle( angle );
        this.addEventListener( egret.Event.ENTER_FRAME, this._onShooting, this );
    }
    
    // 发射开始过程
    private _onShooting ( evt: egret.Event ) {
        // 速度运动
        this._curBubble.x += this._curBubble.speedX;
        this._curBubble.y += this._curBubble.speedY;
        
        if( core.word.isHitSideWall( this._curBubble.x ) ) {
            this._curBubble.speedX = -this._curBubble.speedX;
            if( this._curBubble.x < this.g_bubble.x + df.RADIUS )
                this._curBubble.x = this.g_bubble.x + df.RADIUS;
            else if( this._curBubble.x > this.g_bubble.x + this.g_bubble.width - df.RADIUS )
                this._curBubble.x = this.g_bubble.x + this.g_bubble.width - df.RADIUS;
        }
        
        // 判断撞击
        this._hitBubble = core.word.getHitBubbleIndex( this._curBubble );
        
        if( this._hitBubble == null ) return
        
        this.stopShooting();
    }
    
    // 发射结束
    private stopShooting () {
        this.removeEventListener( egret.Event.ENTER_FRAME, this._onShooting, this );
        
        this._curBubble.stop();
        
        this._fixedCheck( this._hitBubble );
        
        if( !this._fixedBubble ) return;
        // 连击判断
        this._comboCheck( this._fixedBubble );
        // 胜利判断
        if( this.$checkWin() ) {
            this.winResult();
            return;
        }
        // 失败判断
        if( this.$checkLose() ) {
            this.loseResult();
            return;
        }
        
        this.loadBubble();
    }
    
    // 固定监测
    private _fixedCheck ( hitBubble: core.INodeIndex ): void {
        let fixedBubble = core.word.getFixedBubbleIndex( this._curBubble, hitBubble );
        if( fixedBubble === null ) {
            console.error( '不存在可以定位泡泡的位置！！' );
            return;
        }
        this._addBubble( fixedBubble.row, fixedBubble.col, this._curBubble );
        
        this._fixedBubble = fixedBubble;
        this._hitBubble   = null;
        this._curBubble   = null;
    }
    
    // 连击判断
    private _comboCheck ( fixedBubble: core.INodeIndex ): void {
        let combos = core.model.getCombos( fixedBubble.row, fixedBubble.col );
        if( combos.length < 3 ) return;
        
        core.model.removeNode( combos );
        
        let noConnectNodes = core.model.getNoConnectNode();
        
        core.model.removeNode( noConnectNodes );
        this._startDrop( [ ...combos, ...noConnectNodes ] );
    }
    
    // 添加泡泡到容器
    private _addBubble ( row: number, col: number, bubble?: ui.Bubble ): void {
        if( !this._bubbleMap[ row ] ) this._bubbleMap[ row ] = [];
        this._bubbleMap[ row ][ col ] = bubble;
        if( !bubble ) return;
        // 添加到容器
        this.g_bubble.addChild( bubble );
        // 更新物理模型
        core.word.add( bubble, row, col );
        // 更新数据模型
        core.model.addNode( row, col, bubble.value );
    }
    
    // 开始掉落
    private _startDrop ( drops: core.INodeIndex[] ): void {
        let cur: ui.Bubble = null;
        let curIndex: core.INodeIndex;
        while( drops.length ) {
            curIndex = drops.pop();
            cur      = this._bubbleMap[ curIndex.row ][ curIndex.col ];
            
            cur.speedX = Math.pow( -1, Math.ceil( Math.random() * 4 ) ) * ( df.SPEED_X + Math.random() * df.SPEED_X );
            cur.speedY = -df.SPEED_Y + Math.random() * df.SPEED_X;
            cur.g      = df.G + Math.random();
            
            this._bubbleMap[ curIndex.row ][ curIndex.col ] = null;
            this._droppingBubbles.push( cur );
            this.g_bubble.addChild( cur );
        }
        this.addEventListener( egret.Event.ENTER_FRAME, this._onDrop, this );
    }
    
    // 掉落
    private _onDrop ( evt: egret.Event ): void {
        let count           = 0;
        let self            = this;
        let droppingBubbles = self._droppingBubbles;
        let bubble: ui.Bubble;
        for( let i = 0; i < droppingBubbles.length; i++ ) {
            bubble   = droppingBubbles[ i ];
            bubble.x = bubble.x + bubble.speedX;
            bubble.y = bubble.y + bubble.speedY;
            bubble.speedY += bubble.g;
            
            // 触底反弹
            if( core.word.bottom - bubble.y <= df.RADIUS ) {
                bubble.y      = core.word.bottom - df.RADIUS;
                bubble.speedY = -df.U * bubble.speedY;
            }
            
            // 移除屏幕就移除
            if( core.word.left - bubble.x >= df.RADIUS || core.word.right - bubble.x <= -df.RADIUS )
                ui.BubblePool.getIns().recycleBubble( bubble );
            else
                droppingBubbles[ count++ ] = droppingBubbles[ i ];
        }
        // 移除多余的泡泡引用
        for( ; count < droppingBubbles.length; count++ ) {
            droppingBubbles.pop();
        }
        // 全部结束则停止动画
        if( droppingBubbles.length === 0 ) {
            self.removeEventListener( egret.Event.ENTER_FRAME, self._onDrop, self );
            console.log( '动画结束' );
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


    



