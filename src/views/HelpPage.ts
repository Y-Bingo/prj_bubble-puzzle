namespace view {
    
    export class HelpPage extends eui.Component implements IView {
        viewName: string    = 'HelpPage';
        viewType: EViewType = EViewType.PAGE;
        
        // 组件
        btn_return: eui.Button;
        
        constructor () {
            super();
            this.skinName = skins.HelpPage;
        }
        
        public onPreShow ( ...args ): void {
            this.btn_return.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnReturn, this );
        }
        
        private _onBtnReturn (): void {
            viewMrg.showPage( 'MenuPage', { effectType: ui.BOUNCE_EN.LEFT    } )
        }
        
        public onPreClose (): void {
            this.btn_return.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnReturn, this );
            
        }
    }
}