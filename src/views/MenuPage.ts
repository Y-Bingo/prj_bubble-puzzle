namespace view {
    
    export class MenuPage extends eui.Component implements IView {
        
        viewName: string    = 'MenuPage';
        viewType: EViewType = EViewType.PAGE;
        
        // 组件
        logo: eui.Image;
        btn_start: eui.Button;
        btn_help: eui.Button;
        btn_shop: eui.Button;
        // 动画组件
        tgShow: egret.tween.TweenGroup;
        
        constructor () {
            super();
            this.once( eui.UIEvent.COMPLETE, this._onComplete, this );
            this.skinName = skins.MenuPage;
        }
        
        private _onComplete (): void {
        
        }
        
        private _onBtnStart (): void {
            viewMrg.showPanel( 'GameModelPanel', { effectType: ui.BOUNCE_EN.IN } );
            // console.log( '开始' );
        }
        
        private _onBtnHelp (): void {
            viewMrg.showPage( 'HelpPage', { effectType: ui.BOUNCE_EN.RIGHT } );
            // console.log( '帮助' );
        }
        
        private _onBtnShop (): void {
            viewMrg.showPage( 'ShopPage', { effectType: ui.BOUNCE_EN.LEFT } )
        }
        
        onPreShow (): void {
            
            this.tgShow.play( 0 );
        }
        
        onPostShow (): void {
            this.btn_start.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnStart, this );
            this.btn_help.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnHelp, this );
            this.btn_shop.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnShop, this );
        }
        
        onPreClose (): void {
            this.btn_start.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnStart, this );
            this.btn_help.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnHelp, this );
            this.btn_shop.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnShop, this );
        }
    }
}
