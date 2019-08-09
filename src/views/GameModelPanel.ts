namespace view {
    
    export class GameModelPanel extends eui.Component implements IView {
        viewName: string    = 'GameModelPanel';
        viewType: EViewType = EViewType.PANEL;
        
        // 组件
        btn_infinite: ui.ImageButton;       // 无限模式
        btn_level: ui.ImageButton;          // 闯关模式
        
        constructor () {
            super();
            this.skinName = skins.GameModelPanel;
        }
        
        public onPreShow ( ...args ): void {
            this.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchBtn, this );
        }
        
        private _onTouchBtn ( evt: egret.TouchEvent ): void {
            switch( evt.target ) {
                case this.btn_infinite:
                    dt.dataMrg.setGameModel( df.EGameModel.LV );
                    break;
                case this.btn_level:
                    dt.dataMrg.setGameModel( df.EGameModel.LV );
                    viewMrg.closePanel( this.viewName );
                    viewMrg.showPage( 'LevelPage', { effectType: ui.BOUNCE_EN.IN } );
                    break;
                default:
                    break;
            }
        }
        
        public onPreClose (): void {
            this.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchBtn, this );
        }
        
    }
}