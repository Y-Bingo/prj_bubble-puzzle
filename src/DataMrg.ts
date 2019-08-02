namespace dt {
    const LV_MAP_RES = 'lv_map_json';
    
    // 关卡数据
    export interface ILVData {
        map: any[][];            // 地图数据
        next?: any[];            // 待发
        types?: any[];           // 类型种类
        maxScore?: number;       // 最高分
        cellScore?: number;      // 底分
        time?: number;           // 游戏通关时间
    }
    
    // 用户数据
    export interface IUserData {
        name?: string;       // 用户名
        id?: number;         // 用户ID
        coin?: number;       // 金币数量
        lvScore?: number[];  // 通关情况 0,1,2,3 代表通关结果
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
            let data = egret.localStorage.getItem( 'user' );
            let user;
            if( data == 'undefined' ) {
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
                hummer: 0,
                color: 0,
                bomb: 0,
                guid: 0
            };
            this._user     = user;
            this._saveDataToStorage();
        }
        // 保存数据
        private _saveDataToStorage (): void {
            egret.localStorage.setItem( 'user', JSON.stringify( this._user ) );
        }
        
        // 获取关卡数据
        getLvDt ( lv: number ): ILVData {
            if( this._lvMap[ lv ] )
                return this._lvMap[ lv ];
            return null;
        }
        
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
        
        getLvScore () {
            let { lvScore } = this._user;
            return lvScore;
        }
        // 更新关卡成绩
        updateLvScore ( lv: number, value: number ): void {
            this._user.lvScore[ lv ] = Math.max( value, 0 );
            this._saveDataToStorage();
        }
        
        getToolCount () {
            let { toolCount } = this._user;
            return toolCount;
        }
        // 更新道具存量 值为增量
        updateToolCount ( h: number, c: number, b: number, g: number ): void {
            let { hummer, color, bomb, guid } = this._user.toolCount;
            
            this._user.toolCount.hummer = Math.max( hummer + h, 0 );
            this._user.toolCount.color  = Math.max( color + c, 0 );
            this._user.toolCount.bomb   = Math.max( bomb + b, 0 );
            this._user.toolCount.guid   = Math.max( guid + g, 0 );
            this._saveDataToStorage();
        }
        
        // 更新用户数据
        updateUser (): void {
        
        }
        
    }
    
    export const dataMrg = new DataMrg();
}