namespace view {
    export class MsgPanel extends eui.Component implements IView {
        
        viewName: string    = 'MsgPanel';
        viewType: EViewType = EViewType.PANEL;
        
        // 组件
        l_msg: eui.Label;               // 消息
        btn_close: ui.ImageButton;      // 关闭
        
        constructor () {
            super();
            this.skinName = skins.MsgPanel;
        }
        
        private _onTouchTap ( evt: egret.TouchEvent ): void {
            view.viewMrg.closePanel( this.viewName, { effectType: ui.BOUNCE_EX.IN_OUT } );
        }
        
        onPreShow ( msg: string = '' ): void {
            this.l_msg.text = msg;
            this.btn_close.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
        
        onPreClose (): void {
            this.btn_close.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
    }
}