namespace game {
    
    // skin: Timer
    export interface ITimer extends eui.Component {
        bl_time: eui.BitmapLabel;
    }
    
    // 道具item
    export interface IToolItem extends eui.Component {
        icon_tool: eui.Image;           // 道具icon
        bl_num: eui.BitmapLabel;        // 道具数量
    }
    
    // 道具面板
    // export interface IToolBoard {
    //     tool_hummer: IToolItem;
    //     tool_color: IToolItem;
    //     tool_bomb: IToolItem;
    //     tool_guid: IToolItem;
    // }
}