namespace view {
    
    interface ItemData {
        lv: number,
        completion: number;
    }
    
    const PageItemExml  = `
        <e:Skin xmlns:e="http://ns.egret.com/eui" states="up,down,disabled" width="55" height="15">
            <e:Image width="100%" height="100%" source="fanyean_png" source.down="fanyeliang_png" scale9Grid="13,6,17,4" />
        </e:Skin>`;
    const PER_PAGE_ITEM = 20;       // 每页容量
    
    export class LevelPage extends eui.Component implements IView {
        viewName: string    = 'LevelPage';
        viewType: EViewType = EViewType.PAGE;
        
        // 组件
        btn_return: eui.Button;
        bl_completion: eui.BitmapLabel;     // 完成度
        s_container: eui.Scroller;          // 滑动组件
        g_container: eui.Group;             // 内容组件
        g_pages: eui.Group;                 //
        
        // 属性
        data: any[];            // 数据
        curPage: number;        // 当前页数
        pageCount: number;      // 页数
        
        private _isChanging: boolean;         // 是否正在切换页面中
        
        constructor () {
            super();
            this.once( eui.UIEvent.CREATION_COMPLETE, this._onCreateComplete, this );
            this.skinName = skins.LevelPage;
        }
        
        private _onCreateComplete (): void {
            const lvCount       = dt.dataMrg.getLvCount();
            const completions   = dt.dataMrg.getLvCompletion();
            const data          = [];
            // 构造数据
            let completionCount = 0;
            for( let i = 0; i < lvCount; i++ ) {
                if( completions[ i ] != undefined ) {
                    completionCount += completions[ i ] || 0;
                    data.push( { lv: i + 1, completion: completions[ i ], bLock: false } );
                } else {
                    data.push( { lv: i + 1, completion: 0, bLock: true } );
                }
            }
            
            this.data      = data;
            this.curPage   = 0;
            this.pageCount = Math.max( Math.ceil( data.length / PER_PAGE_ITEM ), 1 );
            
            this.s_container.throwSpeed = 0;
            this._updatePages();
            this._updateContain();
            this._updateCompletion( completionCount );
        }
        
        // 更新页标签
        private _updatePages (): void {
            const g_pages   = this.g_pages;
            const pageCount = this.pageCount;
            
            g_pages.removeChildren();
            while( pageCount !== g_pages.numElements ) {
                if( pageCount < g_pages.numElements ) {
                    g_pages.removeChildAt( 0 );
                } else {
                    let radioButton       = new eui.RadioButton();
                    radioButton.skinName  = PageItemExml;
                    radioButton.groupName = 'pages';
                    g_pages.addChild( radioButton );
                }
            }
            
            ( g_pages.getChildAt( this.curPage ) as eui.RadioButton ).selected = true;
        }
        // 更新内容
        private _updateContain (): void {
            this.g_container.removeChildren();
            
            for( let i = 0; i < this.pageCount; i++ ) {
                let titleLayout             = new eui.TileLayout();
                titleLayout.orientation     = eui.TileOrientation.ROWS;
                titleLayout.horizontalAlign = egret.HorizontalAlign.LEFT;
                titleLayout.rowAlign        = eui.RowAlign.TOP;
                titleLayout.horizontalGap   = 18;
                titleLayout.verticalGap     = 14;
                
                let list           = new eui.List();
                list.width         = 560;
                list.height        = 700;
                list.layout        = titleLayout;
                list.touchEnabled  = false;
                list.touchChildren = true;
                
                let source: any = [];
                for( let j = i * PER_PAGE_ITEM; j < Math.min( ( i + 1 ) * PER_PAGE_ITEM, this.data.length ); j++ ) {
                    source.push( this.data[ j ] );
                }
                list.dataProvider = new eui.ArrayCollection( source );
                list.itemRenderer = ui.LevelItemRenderer;
                this.g_container.addChild( list );
            }
        }
        // 更新文字
        private _updateCompletion ( completionCount: number ): void {
            this.bl_completion.text = `${ completionCount }/${ this.data.length * 3 }`
        }
        
        private _onChangeEnd ( evt: eui.UIEvent ): void {
            if( this._isChanging ) return;
            this._isChanging = true;
            
            const viewPort = ( evt.target as eui.Scroller ).viewport;
            const w        = this.s_container.width;
            const page     = Math.round( viewPort.scrollH / w );
            egret.Tween.get( viewPort )
                 .to( { scrollH: page * w + page * 10 }, 200 )
                 .call( () => {
                     ( this.g_pages.getElementAt( page ) as eui.ToggleButton ).selected = true;
                
                     this._isChanging = false;
                 } );
        }
        
        // 换页
        private _onTouchPage ( evt: egret.TouchEvent ): void {
            if( this._isChanging ) return;
            this._isChanging = true;
            
            const w          = this.s_container.width;
            const viewPort   = this.s_container.viewport;
            const targetPage = this.g_pages.getChildIndex( evt.target );
            const step       = ( targetPage - this.curPage ) / Math.abs( targetPage - this.curPage );
            
            console.log( this.curPage, targetPage );
            
            let tween = egret.Tween.get( viewPort );
            while( this.curPage !== targetPage ) {
                this.curPage += step;
                tween = tween.to( { scrollH: ( w + 10 ) * ( this.curPage ) }, 250 ).wait( 100 )
            }
            
            tween.call( () => {
                this._isChanging = false;
            } );
        }
        
        // 触碰lvItem
        private _onTouchLvItem ( evt: egret.TouchEvent ): void {
            if( evt.target === this.g_container ) return;
            if( evt.target.data.bLock ) return;
            dt.dataMrg.setCurLv( evt.target.data.lv );
            view.viewMrg.showPage(
                'GameView',
                { effectType: ui.BOUNCE_EN.UP }
                // [ df.EGameModel.LV, evt.target.data.lv ]
            );
        }
        
        private _onTouchTap (): void {
            view.viewMrg.showPage( 'MenuPage', { effectType: ui.BOUNCE_EN.RIGHT } );
        }
        
        onPreShow (): void {
            // 更新数据
            const data        = this.data;
            const completions = dt.dataMrg.getLvCompletion();
            if( !data ) return;
            
            let bUpdate = false;
            let len     = Math.min( data.length, completions.length );
            for( let i = 0; i < len; i++ ) {
                if( data[ i ].completion === completions[ i ] ) continue;
                bUpdate = true;
                break;
            }
            if( !bUpdate ) return;
            
            // 构造数据
            let completionCount = 0;
            for( let i = 0; i < completions.length; i++ ) {
                completionCount += completions[ i ] || 0;
                data[ i ].completion = completions[ i ];
                data[ i ].bLock      = false;
            }
            
            this._updateContain();
            this._updateCompletion( completionCount );
        }
        
        onPostShow (): void {
            this._isChanging = false;
            this.s_container.addEventListener( eui.UIEvent.CHANGE_END, this._onChangeEnd, this );
            this.g_pages.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchPage, this );
            this.g_container.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchLvItem, this );
            this.btn_return.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
        
        onPreClose (): void {
        }
        
        onPostClose (): void {
            
            this.s_container.removeEventListener( eui.UIEvent.CHANGE_END, this._onChangeEnd, this );
            this.g_pages.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchPage, this );
            this.g_container.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchLvItem, this );
            this.btn_return.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
    }
}