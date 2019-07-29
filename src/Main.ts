
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
        egret.registerImplementation( "eui.IAssetAdapter", assetAdapter );
        egret.registerImplementation( "eui.IThemeAdapter", new ThemeAdapter() );

        this.runGame().catch( e => {
            console.log( e );
        } );
    }

    private async runGame () {
        await this.loadResource();
        console.log( "资源加载完成" );
        this.createGameScene();
    }

    private async loadResource () {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild( loadingView );
            await RES.loadConfig( "resource/default.res.json", "resource/" );
            await this.loadTheme();
            await RES.loadGroup( "preload", 0 );
            await RES.loadGroup( "game", 1 );
            await RES.loadGroup( "common", 1 );
            // 加载游戏数据
            await DataMrg.getIns().loadLVMap();
            this.stage.removeChild( loadingView );
        }
        catch ( e ) {
            console.error( e );
        }
    }

    private loadTheme () {
        return new Promise( ( resolve, reject ) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme( "resource/default.thm.json", this.stage );
            theme.addEventListener( eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this );

        } );
    }

	/**
	 * 创建场景界面
	 * Create scene interface
	 */
    protected createGameScene (): void {

        // let game = new bob.Game();
        // this.addChild( game );
        // new Director( game );

        let gameScene = new GameView();

        this.addChild( gameScene );

        new GameHandler( gameScene );

        gameScene.setLv( 0 );

    }

}
