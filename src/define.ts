namespace df
{

    export class BubbleType extends core.NodeType
    {
        // public static NONE = ".";
        // 透明泡泡
        public static ALPHA = 0x10;
        /**  ---------- 常规球 ----------- */
        // 红
        public static RED = 0x01;
        // 黄
        public static YELLOW = 0x02;
        // 蓝
        public static BLUE = 0x03;
        // 绿
        public static GREEN = 0x04;
        // 橙色
        public static ORANGE = 0x05;
        // 紫
        public static PURPLE = 0x06;
        // 粉红
        public static PINK = 0x07;
        // 黑
        public static BLACK = 0x08;

        /** ---------- 特殊作用球 ---------- */
        // 炸弹
        public static BOMB = 0x11;
        // 云
        public static CLOUD = 0x12;
        // 闪电
        public static LIGHT = 0x13;
        // 疑惑、混沌
        public static PUZZLE = 0x14;

        /** ---------- 道具 ---------- */
        // 彩球
        public static COLOR = 0x0f;
        // 炸弹
        public static BOMB2 = 0x21;
        // 锤子
        public static HUMMER = 0x22;
        // 金币
        public static COIN = 0x23;
    }

    export let BubbleResMap = {
        [ BubbleType.NONE ]: "",
        [ BubbleType.RED ]: "bubble_red_png",
        [ BubbleType.YELLOW ]: "bubble_yellow_png",
        [ BubbleType.BLUE ]: "bubble_blue_png",
        [ BubbleType.GREEN ]: "bubble_green_png",
        [ BubbleType.ORANGE ]: "bubble_orange_png",
        [ BubbleType.PURPLE ]: "bubble_purple_png",
        [ BubbleType.PINK ]: "bubble_pink_png",
        [ BubbleType.BLACK ]: "bubble_black_png",
        [ BubbleType.COLOR ]: "",
        [ BubbleType.LIGHT ]: "",
        [ BubbleType.PUZZLE ]: "",
        [ BubbleType.PUZZLE ]: "",
    }

    // 碰撞结果
    export enum HIT
    {
        BUBBLE = 1,
        TOP_WALL = 2,
        SIDE_WALL = 3,
        BOTTOM_WALL = 4,
        NONE = 0
    }

    // 游戏状态
    export enum EGameStatus
    {
        FREE,
        PLAYING,
        END
    }

    // 每行最大的泡泡数
    export const MAX_COL = 11;
    // 每列最大的泡泡数
    export const MAX_ROW = 14;
    // 最小角度
    export const MIN_ANGLE = -75;
    // 最大角度
    export const MAX_ANGLE = 75;
    // 泡泡飞行的速度
    export const BUBBLE_FLY_SPEED = 12;
    // 泡泡直径
    export const RADIUS = 28;
    // 下一轮
    export const EVT_NEXT_ROUND = "next_round";
    // 下落动画x轴方向的最大速度
    export const SPEED_X = 3;
    // 下落动画y轴方向的最速度
    export const SPEED_Y = 5;
    //碰撞能量损耗系数
    export const U = 0.7;
    // 重力加速度
    export const G = 0.9;

    export const B1 = [ 21, 21, 21, 21, 21, 21, 21, 21, 21, 21 ];

    export const TABLE = [
        [ 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4 ],
        [ 0, 0, 0, 4, 4, 4, 4, 4, 4, 0 ],
        [ 1, 2, 3, 4, 4, 2, 4, 1, 3, 4, 2 ],
        [ 2, 3, 4, 0, 2, 4, 1, 2, 4, 2 ],
        [ 1, 2, 0, 0, 0, 2, 4, 1, 4, 1, 4 ],
        [ 1, 0, 4, 0, 2, 0, 0, 0, 2, 1, ],
        [ 2, 4, 4, 4, 2, 4, 0, 4, 4, 4, 1 ],
        [ 1, 0, 4, 0, 2, 4, 0, 0, 2, 1, ],
        [ 2, 4, 4, 4, 2, 4, 0, 4, 4, 4, 1 ],
        // [ 1, 0, 4, 0, 2, 4, 0, 0, 2, 1, ],
        // [ 2, 4, 4, 4, 2, 4, 0, 4, 4, 4, 1 ],
        // [ 1, 0, 4, 0, 2, 4, 0, 0, 2, 1, ],
        // [ 2, 4, 4, 4, 2, 4, 0, 4, 4, 4, 1 ],
        // [ 1, 0, 4, 0, 2, 4, 0, 0, 2, 1, ],
        // [ 2, 4, 4, 4, 2, 4, 0, 4, 4, 4, 1 ],
        // [ 1, 0, 4, 0, 2, 4, 0, 0, 2, 1, ],
    ];
}
