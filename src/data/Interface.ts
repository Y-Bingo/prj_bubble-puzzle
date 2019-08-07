namespace dt {
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
}