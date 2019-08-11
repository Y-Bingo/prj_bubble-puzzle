namespace view {
    
    export class ResultPanel extends eui.Component implements IView {
        viewName: string    = 'ResultPanel';
        viewType: EViewType = EViewType.PANEL;
        
        // 组件
        icon_pass: eui.Image;
        icon_result: eui.Image;
        icon_completion: eui.Image;
        g_completion: eui.Group;
        bl_score: eui.BitmapLabel;
        bl_maxScore: eui.BitmapLabel;
        
        btn_back: ui.ImageButton;       // 上一关
        btn_restart: ui.ImageButton;    // 重来
        btn_next: ui.ImageButton;       // 下一关
        
        constructor () {
            super();
            this.skinName = skins.ResultPanel;
        }
        
        private _onTouchTap ( evt: egret.TouchEvent ): void {
            const self = this;
            switch( evt.target ) {
                case self.btn_back:
                    dt.dataMrg.setGameStatus( df.EGameStatus.FREE );
                    view.viewMrg.closePanel();
                    view.viewMrg.showPage( 'LevelPage', { effectType: ui.BOUNCE_EN.DOWN } );
                    break;
                case self.btn_restart:
                    dt.dataMrg.setGameStatus( df.EGameStatus.FREE );
                    view.viewMrg.closePanel();
                    view.viewMrg.showPage( 'GameView' );
                    break;
                case self.btn_next:
                    dt.dataMrg.setGameStatus( df.EGameStatus.FREE );
                    dt.dataMrg.setCurLv( dt.dataMrg.getCurLv() + 1 );
                    view.viewMrg.closePanel();
                    view.viewMrg.showPage( 'GameView' );
                    break;
                default:
                    break;
            }
        }
        
        onPreShow ( userScore: number, completion?: number ): void {
            const self      = this;
            const gameModel = dt.dataMrg.getGameModel();
            
            if( gameModel === df.EGameModel.FREE ) {
                self.currentState     = 'free';
                self.bl_maxScore.text = `${ dt.dataMrg.getFreeMaxScore() }`
            } else if( gameModel === df.EGameModel.LV ) {
                self.currentState     = 'lv';
                self.bl_maxScore.text = `${ dt.dataMrg.getLvMaxScore() }`;
                self.bl_score.text    = `${ userScore }`;
                for( let i = 0; i < self.g_completion.numElements; i++ ) {
                    if( i < completion ) {
                        self.g_completion.getChildAt( i ).visible = true;
                    } else {
                        self.g_completion.getChildAt( i ).visible = false;
                    }
                }
            }
            
            if( self.icon_pass ) {
                egret.Tween.get( self.icon_pass, { loop: true } ).to( { rotation: 360 }, 2000 );
            }
        }
        
        onPostShow (): void {
            this.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
        
        onPreClose (): void {
            egret.Tween.removeTweens( this.icon_pass );
        }
        
        onPostClose (): void {
            this.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
        
    }
}