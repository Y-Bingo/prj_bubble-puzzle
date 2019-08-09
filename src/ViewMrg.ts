namespace view {
    
    export enum EViewType {
        NONE  = 0,
        PAGE  = 1,
        GAME  = 2,
        PANEL = 3,
        MSG   = 4,
        OTHER = 5
    }
    
    interface IViewModel {
        // 视图名
        viewName: string;
        // 视图类型
        viewType: EViewType;
    }
    
    interface IViewHandle {
        // 接受显示时的参数
        applyArgs? ( ...args ): void;
        // 显示前回调
        onPreShow? ( ...args ): void;
        // 显示前回调
        onPreClose? (): void;
        
        // 显示后回调
        onPostShow? (): void;
        // 关闭后回调
        onPostClose? (): void;
    }
    
    export interface IView extends eui.Component, IViewModel, IViewHandle {};
    
    /**
     * 页面管理器
     */
    class ViewMrg extends eui.UILayer {
        
        private _stageWidth: number;
        private _stageHeight: number;
        
        // 页面管理集合
        private _pageMap: { [ pageName: string ]: IView };      // 页面 映射
        private _panelMap: { [ panelName: string ]: IView };    // 弹窗页 映射
        
        // 层级UI
        private _pageLayer: eui.UILayer;                    // 页面 层 各主页面
        private _gameLayer: eui.UILayer;                    // 游戏 层 游戏页面
        private _panelLayer: eui.UILayer;                   // 弹窗 层 弹窗、面板
        private _msgLayer: eui.UILayer;                     // 消息 层 loading、全局广播消息、
        
        // 当前显示的UI
        private _curPage: IView;                            // 当前页面
        private _curPanel: IView;                           // 当前弹窗
        private _curGame: string;                           // 当前游戏页面
        
        init ( rootLayer: eui.UILayer ) {
            
            let self = this;
            
            self._stageWidth  = rootLayer.stage.stageWidth;
            self._stageHeight = rootLayer.stage.stageHeight;
            // 添加到舞台
            rootLayer.addChild( self );
            
            // 初始化映射
            self._pageMap  = {};
            self._panelMap = {};
            
            self._initCom();
            self._initLayer();
        }
        // 初始化UI层
        private _initLayer (): void {
            let self = this;
            
            self._pageLayer  = new eui.UILayer();
            self._gameLayer  = new eui.UILayer();
            self._panelLayer = new eui.UILayer();
            self._msgLayer   = new eui.UILayer();
            
            self._gameLayer.touchThrough  = true;
            self._panelLayer.touchThrough = true;
            self._msgLayer.touchThrough   = true;
            
            self.addChild( self._pageLayer );
            self.addChild( self._gameLayer );
            self.addChild( self._panelLayer );
            self.addChild( self._msgLayer );
        }
        // 初始化其他组件
        private _initCom (): void {
            let self       = this;
            self._curPage  = null;
            self._curPanel = null;
        }
        
        /*************** 页面显示 与 关闭 ***************/
        // 显示page
        async showPage ( page: string, amOption?: ui.IAmShowOptions, showArgs?: any ): Promise<any> {
            const self = this;
            const am   = [];
            am.push( self._showPage( page, amOption, showArgs ) );
            if( self._curPage && self._curPage.viewName !== page )
                am.push( self._closePage( self._curPage.viewName, { ...amOption, isReverse: true } as ui.IAmCloseOptions ) );
            
            // 执行动画
            const [ curPage ] = await Promise.all( am );
            
            // 更新
            self._curPage = curPage;
        }
        private _showPage ( page: string, amOption?: ui.IAmShowOptions, showArgs?: any ) {
            const self    = this;
            const curPage = self._pageMap[ page ];
            if( !curPage ) {
                console.warn( `page【${ page }】没有注册` );
                return Promise.resolve( null );
            }
            // 执行生命周期
            curPage.onPreShow && curPage.onPreShow.apply( curPage, showArgs );
            return ui.Am.show( self._pageLayer, curPage, amOption ).then( () => {
                curPage.onPostShow && curPage.onPostShow();
                return Promise.resolve( curPage );
            } );
        }
        
        // 关闭page
        async closePage ( page?: string, amOption?: ui.IAmCloseOptions ): Promise<any> {
            page = page || this._curPage.viewName;
            await this._closePage( page, amOption );
        }
        private _closePage ( page?: string, amOption?: ui.IAmCloseOptions ) {
            const self    = this;
            const curPage = self._pageMap[ page ];
            if( !curPage ) {
                console.warn( `page【${ page }】没有注册` );
                return Promise.resolve( null );
            }
            // 执行生命周期
            curPage.onPreClose && curPage.onPreClose();
            return ui.Am.close( self._pageLayer, curPage, amOption ).then( () => {
                curPage.onPostClose && curPage.onPostClose();
                return Promise.resolve( curPage );
            } );
        }
        
        /*************** 弹窗显示 与 关闭 ***************/
        // 显示 panel
        async showPanel ( panel: string, amOption?: ui.IAmShowOptions, showArgs?: any ) {
            const self = this;
            if( self._curPanel ) {
                await self._closePanel( self._curPanel.viewName, amOption );
            }
            self._curPanel = await self._showPanel( panel, amOption, showArgs );
        }
        private _showPanel ( panel: string, amOption?: ui.IAmShowOptions, showArgs?: any ) {
            const self     = this;
            const curPanel = self._panelMap[ panel ];
            if( !curPanel ) {
                console.warn( `panel【${ panel }】没有注册` );
                return Promise.resolve( curPanel );
            }
            // 执行生命周期
            curPanel.onPreShow && curPanel.onPreShow.apply( curPanel, showArgs );
            return ui.Am.show( self._panelLayer, curPanel, { ...amOption, dark: true } ).then( () => {
                curPanel.onPostShow && curPanel.onPostShow();
                return Promise.resolve( curPanel );
            } );
        }
        
        // // 显示不注册的面板
        // showPanelView ( panel: IView, amOption?: ui.IAmShowOptions, showArgs?: any ) {
        //     panel.onPreShow && panel.onPreShow.apply( panel, showArgs );
        //     return ui.Am.show( this._panelLayer, panel, { ...amOption, dark: true } ).then( () => {
        //         panel.onPostShow && panel.onPostShow();
        //         return Promise.resolve( panel );
        //     } );
        // }
        //
        // closePanelView ( panel: IView, amOption?: ui.IAmShowOptions, showArgs?: any ) {
        //     // 执行生命周期
        //     panel.onPreClose && panel.onPreClose();
        //     return ui.Am.close( this._panelLayer, panel, { ...amOption } ).then( () => {
        //         panel.onPostClose && panel.onPostClose();
        //         return Promise.resolve( panel );
        //     } );
        // }
        
        // 关闭 panel
        async closePanel ( page?: string, amOption?: ui.IAmCloseOptions ) {
            let panel;
            if( !page ) {
                if( this._curPanel )
                    panel = await this._closePanel( this._curPanel.viewName, amOption );
            } else {
                panel = await this._closePanel( page, amOption );
            }
            if( panel == this._curPanel )
                this._curPanel = null;
        }
        private _closePanel ( panel?: string, amOption?: ui.IAmCloseOptions ) {
            const self     = this;
            const curPanel = self._panelMap[ panel ];
            if( !curPanel ) {
                console.warn( `panel【${ panel }】没有注册` );
                return Promise.resolve( curPanel );
            }
            // 执行生命周期
            curPanel.onPreClose && curPanel.onPreClose();
            return ui.Am.close( self._panelLayer, curPanel, { ...amOption } ).then( () => {
                curPanel.onPostClose && curPanel.onPostClose();
                return Promise.resolve( curPanel );
            } );
        }
        
        // 注册页面
        register ( view: IView ): boolean {
            const self = this;
            
            const { viewName, viewType } = view;
            
            let viewMap;
            switch( viewType ) {
                case EViewType.PAGE:
                    viewMap = self._pageMap;
                    break;
                case EViewType.PANEL:
                    viewMap = self._panelMap;
                    break;
                default:
                    return false;
            }
            
            if( viewMap[ viewName ] ) {
                if( DEBUG )
                    egret.warn( `视图【${ viewName }】已注册` );
                return false;
            }
            
            viewMap[ viewName ] = view;
            
            return true;
        }
    }
    
    export const viewMrg = new ViewMrg();
}

