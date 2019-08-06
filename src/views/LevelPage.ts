namespace view {
    
    export class LevelPage extends eui.Component implements IView {
        viewName: string    = 'LevelPage';
        viewType: EViewType = EViewType.PAGE;
        
        // 组件
        btn_return: eui.Button;
        
        constructor () {
            super();
            this.once( eui.UIEvent.COMPLETE, this._onComplete, this );
            this.addEventListener( eui.UIEvent.ADDED_TO_STAGE, this._onAddToStage, this );
            this.skinName = skins.LevelPage;
        }
        
        private _onComplete (): void {
        }
        
        private _onAddToStage (): void {
            this.btn_return.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
        
        private _onTouchTap (): void {
            view.viewMrg.showPage( 'MenuPage', { effectType: ui.BOUNCE_EN.RIGHT } );
        }
        
        onPreShow (): void {
            console.log( `【${ this.viewName }】:preShow` );
        }
        
        onPostShow (): void {
            console.log( `【${ this.viewName }】:postShow` );
            
        }
        
        onPreClose (): void {
            console.log( `【${ this.viewName }】: preClose` );
        }
        
        onPostClose (): void {
            console.log( `【${ this.viewName }】:postClose` );
        }
    }
}