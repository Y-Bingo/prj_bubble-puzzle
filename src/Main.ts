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
        console.log( '资源加载完成' );
        this.createGameScene();
    }
    
    private async loadResource () {
        try {
            await RES.loadConfig( 'resource/default.res.json', 'resource/' );
            await RES.loadGroup( 'preload', 0 );
            const loadingView = new LoadingUI();
            this.stage.addChild( loadingView );
            await this.loadTheme();
            await RES.loadGroup( 'game', 1, loadingView );
            await RES.loadGroup( 'common', 1, loadingView );
            await dt.dataMrg.init();
            this.stage.removeChild( loadingView );
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
        
        let menuPage = new view.MenuPage();
        view.viewMrg.register( menuPage, menuPage.viewName, menuPage.viewType );
        let levelPage = new view.LevelPage();
        view.viewMrg.register( levelPage, levelPage.viewName, levelPage.viewType );
        
        view.viewMrg.showPage( menuPage.viewName );
        
        // let gameScene = new game.GameView();
        //
        // this.addChild( gameScene );
        //
        // new game.GameHandler( gameScene );
        //
        // gameScene.setLv( 1 );
        
        // let resultPanel = new game.ResultPanel();
        // this.addChild( resultPanel );
        // resultPanel.show( df.EGameModel.FREE );
    }
    
}
