
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

        let bubble = new ui.Bubble();
        this.addChild( bubble );
        bubble.setValue( 0x04 );
        bubble.x = this.stage.stageWidth / 2;
        bubble.y = this.stage.stageHeight / 2;

        let mc = new mui.MovieClip( {
            sourceTemp: "mc_humer_%f_png",
            startFrame: 0,
            endFrame: 5,
            frameRate: 11,
            // times: 3
            // isLoop: true
        } )

        this.addChild( mc );


        // let button = new eui.Button();
        // button.width = 200;
        // button.height = 200;
        // button.label = "按钮";

        // this.addChild( button );
        mc.touchEnabled = true;
        mc.addEventListener( egret.TouchEvent.TOUCH_TAP, () => {
            mc.play( () => {
                bubble.visible = false;
            } );
        }, this );

        mc.bindFrameEvent( 4, () => {
            bubble.visible = false;
        } );
        // mc.addEventListener( egret.TouchEvent.COMPLETE, () => {
        //     bubble.visible = false;
        // }, this )

        mc.x = bubble.x;
        mc.y = bubble.y;

        mc.anchorOffsetX = mc.width / 2;
        mc.anchorOffsetY = mc.height / 2;

        // let bomb = new mui.MovieClip( {
        //     sourceTemp: "mc_bomb_%f_png",
        //     startFrame: 0,
        //     endFrame: 5,
        //     frameRate: 10,
        //     // times: 3
        //     // isLoop: true
        // } )
        // this.addChild( bomb );
        // bomb.touchEnabled = true;
        // bomb.addEventListener( egret.TouchEvent.TOUCH_TAP, () => {
        //     bomb.play();
        // }, this );


        // let game = new bob.Game();
        // this.addChild( game );
        // new Director( game );

        // let gameScene = new MainGameScene();

        // this.addChild( gameScene );

        // new Handler( gameScene );

        // gameScene.setLv( 0 );

    }

}
