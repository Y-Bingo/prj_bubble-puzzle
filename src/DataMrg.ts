namespace dt {
    const LV_MAP_RES       = 'lv_map_json';
    const USER_KEY         = 'user';
    const USER_SETTING_KEY = 'setting';
    
    // 关卡数据
    export interface ILVData {
        lv: number;             // 关卡
        map: any[][];            // 地图数据
        next?: any[];            // 待发
        types?: any[];           // 类型种类
        maxScore?: number;       // 最高分
        cellScore?: number;      // 底分
        time?: number;           // 游戏通关时间
        scoreLv: number[];       // 游戏分数等级
    }
    
    // 用户数据
    export interface IUserData {
        name?: string;       // 用户名
        id?: number;         // 用户ID
        coin?: number;       // 金币数量
        completion?: number[];  // 通关情况 0,1,2,3 代表通关结果
        maxScore?: number;   // 自由模式最高分数
        toolCount?: {        // 可用道具
            hummer: number;
            color: number;
            bomb: number;
            guid: number;
        };
    }
    
    // 自定义地图
    export interface ISelfMap extends ILVData {}
    
    class DataMrg {
        
        private _user: IUserData;             // 用户数据
        private _lvMap: ILVData[];           // 关卡数据
        
        constructor () {}
        
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
            user.toolCount = user.toolCount || {
                hummer: 1,
                color: 1,
                bomb: 1,
                guid: 1
            };
            this._user     = user;
            this._saveDataToStorage();
        }
        // 保存数据
        private _saveDataToStorage (): void {
            egret.localStorage.setItem( USER_KEY, JSON.stringify( this._user ) );
        }
        
        // 获取关卡数据
        getLvDt ( lv: number ): ILVData {
            if( this._lvMap[ lv ] )
                return this._lvMap[ lv ];
            return null;
        }
        // 获取总关卡数
        getLvs (): number {
            return this._lvMap.length - 1;
        }
        
        /******************** 获取用户数据  ********************/
        getUserInfo () {
            let { name, id } = this._user;
            return { name, id };
        }
        
        // 获取金币数量
        getCoin () {
            let { coin } = this._user;
            return coin;
        }
        // 更新金币 值为增量
        updateCoin ( value: number ): void {
            let { coin }    = this._user;
            this._user.coin = Math.max( coin + value, 0 );
            this._saveDataToStorage();
        }
        
        getMaxScore () {
            let { maxScore } = this._user;
            return maxScore;
        }
        // 更新用户最大分数
        updateMaxScore ( value: number ): void {
            this._user.maxScore = Math.max( value, 0 );
            this._saveDataToStorage();
        }
        
        getCompletion () {
            let { completion } = this._user;
            return completion || [];
        }
        // 更新关卡成绩
        updateLvScore ( lv: number, value: number ): void {
            this._user.completion[ lv ] = Math.max( value, 0 );
            this._saveDataToStorage();
        }
        
        getToolCount () {
            let { toolCount } = this._user;
            return toolCount;
        }
        // 更新道具存量 值为增量
        updateToolCount ( toolName: string, delta: number ): void {
            let value = this._user.toolCount[ toolName ];
            if( value == null ) return;
            this._user.toolCount[ toolName ] = Math.max( value + delta, 0 );
            
            this._saveDataToStorage();
        }
        
        // 更新用户数据
        updateUser (): void {
        
        }
        
    }
    
    export const dataMrg = new DataMrg();
}