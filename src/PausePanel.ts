namespace game {
    
    export class PausePanel extends eui.Component {
        
        // 组件
        btn_last: ui.ImageButton;
        btn_continue: ui.ImageButton;
        btn_restart: ui.ImageButton;
        btn_close: ui.ImageButton;
        
        btn_music: eui.ToggleButton;
        btn_sound: eui.ToggleButton;
        
        constructor () {
            super();
            this.skinName = skins.PausePanel;
            this.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
        
        private _onTouchTap ( evt: egret.TouchEvent ): void {
            const self = this;
            switch( evt.target ) {
                case self.btn_close:
                    break;
                case self.btn_last:
                    break;
                case self.btn_continue:
                    break;
                case self.btn_restart:
                    break;
                case self.btn_music:
                    break;
                case self.btn_sound:
                    break;
                default:
                    break;
            }
        }
        
        show (): void {
        
        }
        
        close (): void {
        
        }
    }
}