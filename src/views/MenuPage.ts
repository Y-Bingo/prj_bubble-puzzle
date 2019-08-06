namespace view {
    export class MenuPage extends eui.Component implements IView {
        
        viewName: string    = 'MenuPage';
        viewType: EViewType = EViewType.PAGE;
        
        // 组件
        logo: eui.Image;
        btn_start: eui.Button;
        btn_help: eui.Button;
        // 动画组件
        tgShow: egret.tween.TweenGroup;
        
        constructor ( name?: string ) {
            super();
            this.once( eui.UIEvent.COMPLETE, this._onComplete, this );
            this.addEventListener( eui.UIEvent.ADDED_TO_STAGE, this._onAddToStage, this );
            this.addEventListener( eui.UIEvent.REMOVED_FROM_STAGE, this._onRemoveFromStage, this );
            this.skinName = skins.MenuPage;
        }
        
        private _onComplete (): void {
        
        }
        
        private _onAddToStage (): void {
            this.btn_start.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnStart, this );
            this.btn_help.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnHelp, this );
        }
        
        private _onRemoveFromStage (): void {
            this.btn_start.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnStart, this );
            this.btn_help.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnHelp, this );
        }
        
        private _onBtnStart (): void {
            viewMrg.showPage( 'LevelPage', { effectType: ui.BOUNCE_EN.LEFT } );
            console.log( '开始' );
        }
        
        private _onBtnHelp (): void {
            // viewMrg.showPanel( 'Panel', { effectType: ui.BOUNCE_EN.IN, dark: true } );
            console.log( '帮助' );
        }
        
        onPreShow (): void {
            console.log( `【${ this.name }】:preShow` );
            this.tgShow.play( 0 );
            // this.tgPreShow.play(1);
        }
        
        onPostShow (): void {
            console.log( `【${ this.name }】:postShow` );
            
        }
        
        onPreClose (): void {
            console.log( `【${ this.name }】: preClose` );
        }
        
        onPostClose (): void {
            console.log( `【${ this.name }】:postClose` );
        }
    }
}
