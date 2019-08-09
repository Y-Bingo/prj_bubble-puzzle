namespace dt {
    const LV_MAP_RES       = 'lv_map_json';
    const USER_KEY         = 'user';
    const USER_SETTING_KEY = 'setting';
    
    class DataMrg {
        
        private _user: IUserData;           // 用户数据
        private _lvMap: ILVData[];          // 关卡数据
        
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
            await this.loadLVMap();
        }
        // 加载关卡数据
        async loadLVMap ( res: string = LV_MAP_RES ) {
            this._lvMap = await RES.getResAsync( res );
        }
        // 获取用户数据并初始化
        private _initUserData (): void {
            let data = egret.localStorage.getItem( USER_KEY );
            let user = JSON.parse( data );
            if( !user ) {
                user = {};
            } else {
                user = JSON.parse( data ) as IUserData;
            }
            
            user.coin      = user.coin || df.COIN;
            user.name      = user.name || df.NAME;
            user.id        = user.id || df.ID;
            user.maxScore  = user.maxScore || df.MAX_SCORE;
            user.lvScore   = user.lvScore || [];
            user.onMusic   = user.onMusic != undefined ? user.onMusic : false;
            user.onVoice   = user.onVoice != undefined ? user.onVoice : false;
            user.toolCount = user.toolCount || {
                hummer: 1,
                color: 1,
                bomb: 1,
                guid: 1
            };
            
            this._user = user;
            this._saveDataToStorage();
        }
        // 保存数据
        private _saveDataToStorage (): void {
            egret.localStorage.setItem( USER_KEY, JSON.stringify( this._user ) );
        }
        
        /******************** 游戏配置、设置 ********************/
        // 背景音乐设置
        getOnMusic (): boolean { return this._user.onMusic }
        setOnMusic ( value: boolean ) {
            this._user.onMusic = value;
            this._saveDataToStorage();
        }
        // 特效音乐
        getOnVoice (): boolean { return this._user.onVoice }
        setOnVoice ( value: boolean ) {
            this._user.onVoice = value;
            this._saveDataToStorage();
        }
        
        /******************** 关卡数据操作  ********************/
        // 获取当前关卡
        getCurLv (): number {return this._curLv;}
        setCurLv ( value: number ) {this._curLv = Math.max( value, 1 );}
        
        // 获取关卡地图
        getLvMap ( lv: number ): ILVData { return this._lvMap[ lv ] || null;}
        
        // 获取总关卡数
        getLvCount (): number {return this._lvMap.length - 1;}
        
        // 关卡成绩
        getLvCompletion () {
            let { completion } = this._user;
            if( completion ) {
                return completion.slice( 1 );
            }
            return [];
        }
        updateLvCompletion ( lv: number, value: number ): void {
            if( this._user.completion[ lv ] ) {
                value = Math.min( Math.max( value, this._user.completion[ lv ] ), 3 );
            }
            this._user.completion[ lv ] = value;
            if( lv + 1 >= this._user.completion.length )
                this._user.completion[ lv + 1 ] = 0;
            this._saveDataToStorage();
        }
        
        // 获取游戏时间
        getLvTime ( lv: number = this._curLv ): number { return this._lvMap[ lv ].time || df.GAME_TIME;}
        
        /******************** 游戏数据操作  ********************/
        getGameModel (): df.EGameModel { return this._gameModel; }
        setGameModel ( value: df.EGameModel ) { this._gameModel = value;}
        
        getGameStatus (): df.EGameStatus { return this._gameStatus; }
        setGameStatus ( value: df.EGameStatus ) { this._gameStatus = value;}
        
        /******************** 用户数据操作  ********************/
        getUserInfo () {
            let { name, id } = this._user;
            return { name, id };
        }
        
        // 用户金币
        getCoin () {
            // todo 做长度移除处理
            return this._user.coin;
        }
        // value 值为增量
        updateCoin ( delta: number ): void {
            let { coin }    = this._user;
            this._user.coin = Math.max( coin + delta, 0 );
            this._saveDataToStorage();
        }
        
        // 用户最大分数
        getMaxScore () {
            let { maxScore } = this._user;
            return maxScore;
        }
        updateMaxScore ( value: number ): void {
            this._user.maxScore = Math.max( value, 0 );
            this._saveDataToStorage();
        }
        
        // 用户道具
        getToolCount () {
            let { toolCount } = this._user;
            return toolCount;
        }
        // delta 为增量
        updateToolCount ( toolName: string, delta: number ): void {
            let value = this._user.toolCount[ toolName ];
            if( value == null ) return;
            this._user.toolCount[ toolName ] = Math.max( value + delta, 0 );
            
            this._saveDataToStorage();
        }
    }
    
    export const dataMrg = new DataMrg();
}