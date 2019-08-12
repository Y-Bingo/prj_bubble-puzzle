namespace dt {
    const LV_MAP_RES       = 'lv_map_json';
    const USER_KEY         = 'user';
    const GAME_KEY         = 'game';
    const USER_SETTING_KEY = 'setting';
    
    const KEY_MAP = {
        [ USER_KEY ]: '_userDt',
        [ GAME_KEY ]: '_gameDt'
    };
    
    class DataMrg {
        
        private _userDt: IUserDt;           // 用户数据
        private _gameDt: IGameDt;           // 游戏数据
        private _lvMap: ILVDt[];            // 关卡数据
        
        private _curLv: number;             // 当前关卡
        private _gameModel: df.EGameModel;  // 游戏模式
        private _gameStatus: df.EGameStatus;// 游戏状态
        
        constructor () {
            this._gameModel  = df.EGameModel.NONE;
            this._gameStatus = df.EGameStatus.FREE;
        }
        
        /******************** 数据初始化  ********************/
        async init () {
            this._initUserData();
            this._initGameDt();
            await this.loadLVMap();
        }
        // 加载关卡数据
        async loadLVMap ( res: string = LV_MAP_RES ) {
            this._lvMap = await RES.getResAsync( res );
        }
        
        private _readLocalDt<T> ( key: any ): T {
            let originDt = egret.localStorage.getItem( key );
            if( !originDt ) {
                originDt = null;
            }
            let data = JSON.parse( originDt ) as T;
            if( !data ) {
                data = {} as T;
            } else {
                data = JSON.parse( originDt ) as T;
            }
            
            return data;
        }
        // 保存数据
        private _saveLocalDt ( key: any ): void {
            egret.localStorage.setItem( key, JSON.stringify( this[ KEY_MAP[ key ] ] ) );
        }
        
        // 初始化/读取 用户数据
        private _initUserData (): void {
            const userDt: IUserDt = this._readLocalDt<IUserDt>( USER_KEY );
            
            userDt.coin      = userDt.coin || df.COIN;
            userDt.name      = userDt.name || df.NAME;
            userDt.id        = userDt.id || df.ID;
            userDt.onMusic   = userDt.onMusic != undefined ? userDt.onMusic : false;
            userDt.onVoice   = userDt.onVoice != undefined ? userDt.onVoice : false;
            userDt.toolCount = userDt.toolCount || {
                hummer: 1,
                color: 1,
                bomb: 1,
                guid: 1
            };
            
            this._userDt = userDt;
            this._saveLocalDt( USER_KEY );
        }
        
        // 初始化/读取 游戏数据
        private _initGameDt (): void {
            const gameDt: IGameDt = this._readLocalDt<IGameDt>( GAME_KEY );
            
            gameDt.completion   = gameDt.completion || [ 0 ];
            gameDt.lvMaxScore   = gameDt.lvMaxScore || [];
            gameDt.freeMaxScore = gameDt.freeMaxScore || 0;
            
            this._gameDt = gameDt;
            this._saveLocalDt( GAME_KEY );
        }
        
        /******************** 游戏配置、设置 ********************/
        // 背景音乐设置
        getOnMusic (): boolean { return this._userDt.onMusic }
        setOnMusic ( value: boolean ) {
            this._userDt.onMusic = value;
            this._saveLocalDt( USER_KEY );
        }
        // 特效音乐
        getOnVoice (): boolean { return this._userDt.onVoice }
        setOnVoice ( value: boolean ) {
            this._userDt.onVoice = value;
            this._saveLocalDt( USER_KEY );
        }
        
        /******************** 关卡数据操作  ********************/
        // 获取当前关卡
        getCurLv (): number {return this._curLv;}
        setCurLv ( value: number ) {
            
            this._curLv = Math.min( Math.max( value, 1 ), this._gameDt.completion.length );
            this._curLv = Math.min( Math.max( value, 1 ), this._lvMap.length - 1 );
            
            if( !this._gameDt.completion[ this._curLv - 1 ] )
                this._gameDt.completion[ this._curLv - 1 ] = 0;
            if( !this._gameDt.lvMaxScore[ this._curLv - 1 ] )
                this._gameDt.lvMaxScore[ this._curLv - 1 ] = 0;
        }
        
        // 获取关卡地图
        getLvMap ( lv: number ): ILVDt { return this._lvMap[ lv ] || null;}
        
        // 获取总关卡数
        getLvCount (): number {return this._lvMap.length - 1;}
        
        // 获取游戏时间
        getLvTime ( lv: number = this._curLv ): number { return this._lvMap[ lv ].time || df.GAME_TIME;}
        
        /******************** 游戏数据操作  ********************/
        // 游戏模式
        getGameModel (): df.EGameModel { return this._gameModel; }
        setGameModel ( value: df.EGameModel ) { this._gameModel = value;}
        // 游戏状态
        getGameStatus (): df.EGameStatus { return this._gameStatus; }
        setGameStatus ( value: df.EGameStatus ) { this._gameStatus = value;}
        
        // 关卡成绩
        getCompletion () { return this._gameDt.completion || [] }
        getLvCompletion ( lv: number = this._curLv ): number { return this._gameDt.completion[ lv - 1 ] || 0 }
        updateLvCompletion ( value: number ): number {
            const lv               = this._curLv - 1;
            const gameDt           = this._gameDt;
            const originCompletion = gameDt.completion[ lv ];
            if( originCompletion != undefined ) {
                gameDt.completion[ lv ] = Math.min( Math.max( value, originCompletion ), 3 );
            }
            
            // 开启新关卡
            if( this._gameDt.completion[ lv ] && lv + 1 >= this._gameDt.completion.length ) {
                gameDt.completion[ lv + 1 ] = 0;
            }
            // console.log( 'save Completion', this._curLv, value );
            this._saveLocalDt( GAME_KEY );
            return gameDt.completion[ lv ] - originCompletion;
        }
        
        // 用户最大分数
        getFreeMaxScore () { return this._gameDt.freeMaxScore || 0; }
        updateMaxScore ( value: number ): void {
            this._gameDt.freeMaxScore = Math.max( value, 0 );
            this._saveLocalDt( GAME_KEY );
        }
        // 关卡最高成绩
        getLvMaxScore ( lv: number = this._curLv ): number { return this._gameDt.lvMaxScore[ lv - 1 ] || 0 }
        updateLvMaxScore ( value: number ): void {
            const lv     = this._curLv - 1;
            const gameDt = this._gameDt;
            
            if( gameDt.lvMaxScore[ lv ] != undefined ) {
                gameDt.lvMaxScore[ lv ] = Math.max( value, gameDt.lvMaxScore[ lv ] );
            }
            // console.log( 'save lvMaxScore', this._curLv, value );
            this._saveLocalDt( GAME_KEY );
        }
        
        /******************** 用户数据操作  ********************/
        getUserInfo () {
            let { name, id } = this._userDt;
            return { name, id };
        }
        
        // 用户金币
        getCoin () {
            // todo 做长度移除处理
            return this._userDt.coin;
        }
        // value 值为增量
        updateCoin ( delta: number ): void {
            let { coin }      = this._userDt;
            this._userDt.coin = Math.max( coin + delta, 0 );
            this._saveLocalDt( USER_KEY );
        }
        
        // 用户道具
        getToolCount () {
            let { toolCount } = this._userDt;
            return toolCount;
        }
        // delta 为增量
        updateToolCount ( toolName: string, delta: number ): void {
            let value = this._userDt.toolCount[ toolName ];
            if( value == null ) return;
            this._userDt.toolCount[ toolName ] = Math.max( value + delta, 0 );
            
            this._saveLocalDt( USER_KEY );
        }
    }
    
    export const dataMrg = new DataMrg();
}