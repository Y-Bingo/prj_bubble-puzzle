namespace view {
    
    export class PausePanel extends eui.Component implements IView {
        viewName: string    = 'PausePanel';
        viewType: EViewType = EViewType.PANEL;
        // 组件
        btn_back: ui.ImageButton;       // 返回
        btn_last: ui.ImageButton;       // 上一关
        btn_continue: ui.ImageButton;   // 继续游戏
        btn_restart: ui.ImageButton;    // 重新开始
        btn_close: ui.ImageButton;      // 关闭
        
        btn_music: eui.ToggleButton;    // 音乐
        btn_voice: eui.ToggleButton;    // 特效音
        
        constructor () {
            super();
            this.skinName = skins.PausePanel;
        }
        
        private _onTouchTap ( evt: egret.TouchEvent ): void {
            const self = this;
            switch( evt.target ) {
                case self.btn_close:
                case self.btn_continue:
                    view.viewMrg.closePanel( this.viewName, { effectType: ui.BOUNCE_EX.IN_OUT } );
                    timerHandler.star();
                    break;
                case self.btn_back:
                    dt.dataMrg.setGameStatus( df.EGameStatus.FREE );
                    view.viewMrg.closePanel();
                    view.viewMrg.showPage( 'LevelPage', { effectType: ui.BOUNCE_EN.DOWN } );
                    break;
                case self.btn_last:
                    dt.dataMrg.setGameStatus( df.EGameStatus.FREE );
                    dt.dataMrg.setCurLv( dt.dataMrg.getCurLv() - 1 );
                    view.viewMrg.closePanel();
                    view.viewMrg.showPage( 'GameView' );
                    
                    break;
                case self.btn_restart:
                    dt.dataMrg.setGameStatus( df.EGameStatus.FREE );
                    view.viewMrg.closePanel();
                    view.viewMrg.showPage( 'GameView' );
                    break;
                case self.btn_music:
                    dt.dataMrg.setOnMusic( self.btn_music.selected );
                    // todo 控制声音输出
                    break;
                case self.btn_voice:
                    dt.dataMrg.setOnVoice( self.btn_voice.selected );
                    // todo 控制声音输出
                    break;
                default:
                    break;
            }
        }
        
        onPreShow (): void {
            this.btn_music.selected = dt.dataMrg.getOnMusic();
            this.btn_voice.selected = dt.dataMrg.getOnVoice();
            
            timerHandler.stop();
        }
        
        onPostShow (): void {
            this.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
        
        onPreClose (): void {
            this.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
    }
}