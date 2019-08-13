class Main extends eui.UILayer {
    
    protected createChildren (): void {
        super.createChildren();
        
        egret.lifecycle.addLifecycleListener( ( context ) => {
            // custom lifecycle plugin
        } );
        
        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        };
        
        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        };
        
        //inject the custom material parser
        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation( 'eui.IAssetAdapter', assetAdapter );
        egret.registerImplementation( 'eui.IThemeAdapter', new ThemeAdapter() );
        
        this.runGame().catch( e => {
            console.log( e );
        } );
    }
    
    private async runGame () {
        await this.loadResource();
        this.createGameScene();
    }
    
    private _loadingView;
    private async loadResource () {
        try {
            await RES.loadConfig( 'resource/default.res.json', 'resource/' );
            await RES.loadGroup( 'preload', 0 );
            this._loadingView = new LoadingUI();
            this.addChild( this._loadingView );
            await this.loadTheme();
            await RES.loadGroup( 'game', 1, this._loadingView );
            await dt.dataMrg.init();
        } catch( e ) {
            console.error( e );
        }
    }
    
    private loadTheme () {
        return new Promise( ( resolve, reject ) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme( 'resource/default.thm.json', this.stage );
            theme.once( eui.UIEvent.COMPLETE, resolve, this );
        } );
    }
    
    /**
     * 创建场景界面
     * Create scene interface
     */
    protected createGameScene (): void {
        view.viewMrg.init( this );
        view.viewMrg.register( new view.MenuPage() );
        view.viewMrg.register( new view.GameModelPanel() );
        view.viewMrg.register( new view.ShopPage() );
        view.viewMrg.register( new view.HelpPage() );
        view.viewMrg.register( new view.LevelPage() );
        view.viewMrg.register( new view.PausePanel() );
        view.viewMrg.register( new view.GameView() );
        view.viewMrg.register( new view.ResultPanel() );
        view.viewMrg.register( new view.MsgPanel() );
        
        view.viewMrg.showPage( 'MenuPage' );
        this.removeChild( this._loadingView );
    }
    
}
