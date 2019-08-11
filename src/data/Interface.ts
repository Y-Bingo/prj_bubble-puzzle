namespace dt {
    // 关卡数据
    export interface ILVDt {
        lv: number;              // 关卡
        map: any[][];            // 地图数据
        next?: any[];            // 待发
        types?: any[];           // 类型种类
        maxScore?: number;       // 最高分
        cellScore?: number;      // 底分
        time?: number;           // 游戏通关时间
        scoreLv?: number[];      // 游戏分数等级
    }
    
    // 用户数据
    export interface IGameDt {
        completion?: number[];      // 关卡完成度
        lvMaxScore?: number[];      // 关卡最高分数
        freeMaxScore?: number;      // 无限模式最高分数
    }
    
    // 用户数据
    export interface IUserDt {
        name?: string;       // 用户名
        id?: number;         // 用户ID
        coin?: number;       // 金币数量
        onMusic?: boolean;       // 是否开启bgm
        onVoice?: boolean;    // 是否开启特效音
        toolCount?: {        // 可用道具
            hummer: number;
            color: number;
            bomb: number;
            guid: number;
        };
    }
    
    // 自定义地图
    export interface ISelfMap extends ILVDt {}
}