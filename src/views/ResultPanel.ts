namespace view {
    
    export class ResultPanel extends eui.Component {
        
        // 组件
        icon_pass: eui.Image;
        icon_result: eui.Image;
        icon_completion: eui.Image;
        g_completion: eui.Group;
        bl_score: eui.BitmapLabel;
        bl_maxScore: eui.BitmapLabel;
        
        btn_last: ui.ImageButton;       // 上一关
        btn_restart: ui.ImageButton;    // 重来
        btn_next: ui.ImageButton;       // 下一关
        
        constructor () {
            super();
            this.skinName = skins.ResultPanel;
        }
        
        protected childrenCreated (): void {
            // this.addEventListener( egret.Event.ADDED_TO_STAGE, this._onAddToStage, this );
            this.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
        
        private _onAddToStage (): void {
        
        }
        
        private _onTouchTap ( evt: egret.TouchEvent ): void {
            const self = this;
            switch( evt.target ) {
                case self.btn_last:
                    break;
                case self.btn_restart:
                    break;
                case self.btn_next:
                    break;
                default:
                    break;
            }
        }
        
        show ( gameModel: df.EGameModel = df.EGameModel.LV ): void {
            const self        = this;
            self.currentState = gameModel === df.EGameModel.FREE ? 'free' : 'lv';
            if( this.icon_pass )
                egret.Tween.get( this.icon_pass, { loop: true } ).to( { rotation: 360 }, 2000 );
        }
        
        close (): void {
            
            egret.Tween.removeTweens( this.icon_pass );
        }
        
    }
}