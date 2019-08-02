namespace game {
    
    // 道具组件
    export interface IToolItem extends eui.Component {
        icon_tool: eui.Image;           // 道具icon
        bl_tool_num: eui.BitmapLabel;   // 道具数量
    }
    
    // 道具面板
    export interface IToolBoard {
        tool_hummer: IToolItem;
        tool_color: IToolItem;
        tool_bomb: IToolItem;
        tool_guid: IToolItem;
    }
    
    export class ToolBoard implements IToolBoard {
        
        // 组件
        private _gameScene: GameView;
        tool_hummer: IToolItem;
        tool_color: IToolItem;
        tool_bomb: IToolItem;
        tool_guid: IToolItem;
        
        // 属性
        private _data: {            // 数据
            hummer: number;
            color: number;
            bomb: number;
            guid: number;
        };
        
        constructor ( gameScene: GameView ) {
            this._gameScene  = gameScene;
            this.tool_hummer = gameScene.tool_hummer as IToolItem;
            this.tool_color  = gameScene.tool_color as IToolItem;
            this.tool_bomb   = gameScene.tool_bomb as IToolItem;
            this.tool_guid   = gameScene.tool_guid as IToolItem;
        }
        
        // 更新
        updateScore (): void {
        
        }
        
        // 上传当前的道具数据
        upload (): void {
        
        }
    }
}