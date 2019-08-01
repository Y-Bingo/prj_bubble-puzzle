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
        name: string;       // 用户名
        id: number;         // 用户ID
        coin: number;       // 金币数量
        lvScore: number[];  // 通关情况 0,1,2,3 代表通关结果
        maxScore: number;   // 自由模式最高分数
        toolCount: {        // 可用道具
            hummer: number;
            color: number;
            bomb: number;
            guid: number;
        };
    }
    
    // 自定义地图
    export interface ISelfMap extends ILVData {}
    
    class DataMrg {
        
        private _user: any;             // 用户数据
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
            let user       = JSON.parse( egret.localStorage.getItem( 'user' ) ) as IUserData;
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
            this._saveData();
        }
        // 保存数据
        private _saveData (): void {
            egret.localStorage.setItem( 'user', JSON.stringify( this._user ) );
        }
        
        // 获取关卡数据
        getLvDt ( lv: number ): ILVData {
            if( this._lvMap[ lv ] )
                return this._lvMap[ lv ];
            return null;
        }
        
        // 更新用户数据
        updateUser (): void {
        
        }
        
    }
    
    export const dataMrg = new DataMrg();
}