namespace df {
    // 道具掩码
    export const TOOL_MASK = 0xf0;
    
    export class BubbleType extends core.NodeType {
        // public static NONE = ".";
        // 透明泡泡
        public static ALPHA  = 0x10;
        /**  ---------- 常规球 ----------- */
                      // 红
        public static RED    = 0x01;
        // 黄
        public static YELLOW = 0x02;
        // 蓝
        public static BLUE   = 0x03;
        // 绿
        public static GREEN  = 0x04;
        // 橙色
        public static ORANGE = 0x05;
        // 紫
        public static PURPLE = 0x06;
        // 粉红
        public static PINK   = 0x07;
        // 黑
        public static BLACK  = 0x08;
        
        /** ---------- 特殊作用球 ---------- */
                      // 炸弹
        public static BOMB   = 0x09;
        // 云
        public static CLOUD  = 0x08;
        // 闪电
        public static LIGHT  = 0x0A;
        // 疑惑、混沌
        public static PUZZLE = 0x0B;
        
        /** ---------- 道具 ---------- */
                      // 彩球
        public static COLOR  = 0x1f;
        // 炸弹
        public static BOMB2  = 0x11;
        // 锤子
        public static HUMMER = 0x12;
        // 金币
        public static COIN   = 0x13;
    }
    
    export const BubbleResMap = {
        [ BubbleType.NONE ]: '',
        [ BubbleType.RED ]: 'bubble_red_png',
        [ BubbleType.YELLOW ]: 'bubble_yellow_png',
        [ BubbleType.BLUE ]: 'bubble_blue_png',
        [ BubbleType.GREEN ]: 'bubble_green_png',
        [ BubbleType.ORANGE ]: 'bubble_orange_png',
        [ BubbleType.PURPLE ]: 'bubble_purple_png',
        [ BubbleType.PINK ]: 'bubble_pink_png',
        [ BubbleType.BLACK ]: 'bubble_black_png',
        // [ BubbleType.ALPHA ]: 'bubble_alpha_png',
        [ BubbleType.ALPHA ]: '',
        [ BubbleType.COLOR ]: 'prop_colorBall_png',
        [ BubbleType.BOMB2 ]: 'prop_bomb_png',
        [ BubbleType.COIN ]: 'icon_coin_png',
        [ BubbleType.HUMMER ]: 'prop_hammer_png'
    };
    
    export const BubbleName: { [ bubble: number ]: string } = {
        [ BubbleType.NONE ]: '没',
        [ BubbleType.RED ]: '红',
        [ BubbleType.YELLOW ]: '黄',
        [ BubbleType.BLUE ]: '蓝',
        [ BubbleType.GREEN ]: '绿',
        [ BubbleType.ORANGE ]: '橙',
        [ BubbleType.PURPLE ]: '紫',
        [ BubbleType.PINK ]: '粉',
        [ BubbleType.BLACK ]: '黑',
        [ BubbleType.ALPHA ]: '透明',
        [ BubbleType.COLOR ]: '彩色',
        [ BubbleType.BOMB2 ]: '炸弹',
        [ BubbleType.COIN ]: '金币',
        [ BubbleType.HUMMER ]: '锤子'
    };
    
    // 碰撞结果
    export enum HIT {
        BUBBLE      = 1,
        TOP_WALL    = 2,
        SIDE_WALL   = 3,
        BOTTOM_WALL = 4,
        NONE        = 0
    }
    
    // 游戏状态
    export enum EGameStatus {
        FREE,
        PLAYING,
        END
    }
    
    // 游戏模式
    export enum EGameModel {
        NONE,   // 空
        LV,     // 闯关模式
        FREE    // 自由模式
    }
    
    // 每行最大的泡泡数
    export const MAX_COL            = 11;
    // 每列最大的泡泡数
    export const MAX_ROW            = 14;
    // 最小角度
    export const MIN_ANGLE          = -75;
    // 最大角度
    export const MAX_ANGLE          = 75;
    // 泡泡飞行的速度 Y轴方向
    export const BUBBLE_FLY_SPEED_Y = 14;
    // 泡泡直径
    export const RADIUS             = 28;
    // 自转角度
    export const ROTATION           = 20;
    // 下一轮
    export const EVT_NEXT_ROUND     = 'next_round';
    // 下落动画x轴方向的最大速度
    export const SPEED_X            = 5;
    // 下落动画y轴方向的最速度
    export const SPEED_Y            = 8;
    //碰撞能量损耗系数
    export const U                  = 0.6;
    // 重力加速度
    export const G                  = 0.9;
    // 震动次数
    export const SHAKE_COUNT        = 8;
    // 震动速度
    export const SHAKE_SPEED        = 10;
    
    // 负一层
    export const B1 = [ 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10 ];
    
    /* -------------------- 游戏其他定义 --------------------*/
    
    // 默认玩家名
    export const NAME       = '游客';
    // 默认玩家ID
    export const ID         = 9527;
    // 默认金币数量
    export const COIN       = 180;
    // 默认道具数量
    export const TOOL_COUNT = 1;
    // 默认自由模式最高分数
    export const MAX_SCORE  = 0;
    
    // 默认：连击分数奖励
    export const COMBO_LV               = [ 8, 16, 24 ];
    // 默认： 连击底分
    export const COMBOS_CELL_SCORE      = 10;
    // 默认：游戏分数奖励
    export const COMBOS_BONUS           = [ 8, 16, 32 ];
    // 默认：关卡时间
    export const GAME_TIME              = 30;
    // 默认：游戏通关奖励
    export const BONUS                  = [ 5, 10, 30 ];
    // 默认：游戏积分转金币
    export const SCORE_CHANGE_COIN      = 10;
    // 完成度转金币
    export const COMPLETION_CHANGE_COIN = 10;
    // 默认： 游戏积分进度等级
    export const SCORE_LV               = [ 30, 60, 100 ];
    
    // 道具价格
    export const TOOL_PRICE = {
        hummer: 80,
        bomb: 180,
        color: 240,
        guid: 100
    }
}
