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
        // 显示前回调
        onPreShow? (): void;
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
        // private static _instance: ViewMrg = null;
        // public static getIns (): ViewMrg {
        //     if( !this._instance )
        //         this._instance = new ViewMrg();
        //     return this._instance;
        // }
        
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
        async showPage ( page: string | IView, amOption?: ui.IAmShowOptions ): Promise<any> {
            const self    = this;
            const curPage = typeof page == 'string' ? self._pageMap[ page as string ] : page;
            
            if( !curPage ) return Promise.reject( `！page 打开失败` );
            
            const am       = [];
            const lastPage = self._curPage;
            am.push( self._showPage( curPage, amOption ) );
            am.push( self._closePage( lastPage, { ...amOption, isReverse: true } as ui.IAmCloseOptions ) )
            
            // 执行动画
            await Promise.all( am );
            
            // 更新
            self._curPage = curPage;
        }
        private _showPage ( page: string | IView, amOption?: ui.IAmShowOptions, showArgs?: any ) {
            const self    = this;
            const curPage = typeof page == 'string' ? self._pageMap[ page as string ] : page;
            if( !curPage ) {
                console.warn( `打开的page 不存在！` );
                return Promise.resolve();
            }
            // 执行生命周期
            curPage.onPreShow && curPage.onPreShow();
            return ui.Am.show( self._pageLayer, curPage, amOption ).then( () => {
                curPage.onPostShow && curPage.onPostShow();
            } );
        }
        
        // 关闭page
        async closePage ( page?: string | IView, amOption?: ui.IAmCloseOptions ): Promise<any> {
            await this._closePage( page, amOption );
        }
        private _closePage ( page?: string | IView, amOption?: ui.IAmCloseOptions ) {
            const self    = this;
            const curPage = typeof page == 'string' ? self._pageMap[ page as string ] : page;
            if( !curPage ) {
                console.warn( `关闭的page 不存在！` );
                return Promise.resolve();
            }
            
            // 执行生命周期
            curPage.onPreClose && curPage.onPreClose();
            return ui.Am.close( self._pageLayer, curPage, amOption ).then( () => {
                curPage.onPostShow && curPage.onPostShow();
            } );
        }
        
        /*************** 弹窗显示 与 关闭 ***************/
        private _panelMask: eui.Rect;
        // 显示 panel
        showPanel ( name: string ): Promise<any> {
            let self = this;
            
            let curPanel = self._panelMap[ name ];
            // 注册验证
            if( !curPanel ) {
                if( DEBUG )
                    egret.warn( `弹窗【${ name }】还没注册!` );
                return Promise.reject( '' );
            }
            // 验证是否没有关闭之前的弹窗
            if( self._curPanel && self._curPanel.parent ) {
                if( DEBUG )
                    egret.warn( `当前弹窗【${ self._curPanel.name }】还没关闭` );
                self._curPanel.onPreClose && self._curPanel.onPreClose();
                self._curPanel.parent.removeChild( self._curPanel );
                self._curPanel.onPostClose && self._curPanel.onPostClose();
            }
            
            // 添加灰色背景
            !self._panelMask.parent && self._panelLayer.addChild( self._panelMask );
            // 添加弹窗
            curPanel.onPreShow && curPanel.onPreShow();
            // todo 动画
            self._panelLayer.addChild( curPanel );
            curPanel.x = ( self._stageWidth - curPanel.width ) / 2;
            curPanel.y = ( self._stageHeight - curPanel.height ) / 2;
            
            curPanel.onPostShow && curPanel.onPostShow();
            
            // 更新
            self._curPanel = curPanel;
            
            return Promise.resolve();
        }
        // 关闭 panel
        closePanel ( name?: string ): Promise<any> {
            let self = this;
            
            let curPanel = name ? self._panelMap[ name ] : self._curPanel;
            
            if( !curPanel || !curPanel.parent ) {
                self._curPanel = null;
                return Promise.resolve();
            }
            
            // 移除弹窗
            curPanel.onPreClose && curPanel.onPreClose();
            // todo: 动画
            self._panelLayer.removeChild( curPanel );
            // 移除灰色背景
            self._panelMask.parent && self._panelLayer.removeChild( self._panelMask );
            
            curPanel.onPostClose && curPanel.onPostClose();
            
            // 更新
            self._curPanel = null;
            return Promise.resolve();
        }
        
        /********** 游戏界面显示 与 关闭 **********/
        // // 显示page
        // showGame (): Promise<any>
        // {
        //     return Promise.resolve();
        // }
        // // 关闭page
        // closeGame (): Promise<any>
        // {
        //     return Promise.resolve();
        // }
        
        // 注册页面
        register ( view: IView, viewName: string, viewType?: EViewType ): boolean {
            let self = this;
            
            viewName = viewName;
            viewType = viewType || view.viewType;
            
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

