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
        s_contanier: eui.Scroller;          // 滑动组件
        g_container: eui.Group;             // 内容组件
        g_pages: eui.Group;                 //
        
        // 属性
        data: any;          // 数据
        curPage: number;    // 当前页数
        pageCount: number;  // 页数
        
        constructor () {
            super();
            this.once( eui.UIEvent.CREATION_COMPLETE, this._onCreateComplete, this );
            this.addEventListener( eui.UIEvent.ADDED_TO_STAGE, this._onAddToStage, this );
            this.skinName = skins.LevelPage;
        }
        
        private _onCreateComplete (): void {
            const lvCount     = dt.dataMrg.getLvs();
            const completions = dt.dataMrg.getCompletion();
            const data        = [];
            // 构造数据
            for( let i = 0; i < lvCount; i++ ) {
                data.push( { lv: i + 1, completion: completions[ i ] || 0 } );
            }
            
            this.pageCount = Math.max( Math.ceil( data.length / PER_PAGE_ITEM ), 1 );
            this.data      = data;
            this.curPage   = 1;
            
            this._updatePages();
            this._updateContain();
        }
        
        // 更新页标签
        private _updatePages (): void {
            const g_pages   = this.g_pages;
            const pageCount = this.pageCount;
            while( pageCount !== g_pages.numElements ) {
                if( pageCount < g_pages.numElements ) {
                    g_pages.removeChildAt( 0 );
                } else {
                    let radioButton      = new eui.RadioButton();
                    radioButton.skinName = PageItemExml;
                    g_pages.addChild( radioButton );
                }
            }
            for( let i = 0; i < g_pages.numElements; i++ ) {
                ( g_pages.getChildAt( i ) as eui.RadioButton ).groupName = 'pages';
            }
            
            ( g_pages.getChildAt( this.curPage - 1 ) as eui.RadioButton ).selected = true;
        }
        
        // 更新内容
        private _updateContain (): void {
            this.g_container.removeChildren();
            let titleLayout             = new eui.TileLayout();
            titleLayout.orientation     = eui.TileOrientation.ROWS;
            titleLayout.horizontalAlign = egret.HorizontalAlign.LEFT;
            titleLayout.rowAlign        = eui.RowAlign.TOP;
            titleLayout.horizontalGap   = 18;
            titleLayout.verticalGap     = 14;
            
            for( let i = 0; i < this.pageCount; i++ ) {
                let list    = new eui.Group();
                list.width  = 560;
                list.height = 700;
                list.layout = titleLayout;
                for( let j = i * PER_PAGE_ITEM; j < Math.min( ( i + 1 ) * PER_PAGE_ITEM, this.data.length ); j++ ) {
                    list.addChild( new ui.LevelItemRenderer( this.data[ j ] ) );
                }
                this.g_container.addChild( list );
            }
            for( let i = 0; i < this.g_container.numElements; i++ ) {
                console.log( ( this.g_container.getElementAt( i ) as eui.List ).$children );
            }
        }
        
        private _onAddToStage (): void {
            this.btn_return.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
        
        private _onTouchTap (): void {
            view.viewMrg.showPage( 'MenuPage', { effectType: ui.BOUNCE_EN.RIGHT } );
        }
        
        onPreShow (): void {
            console.log( `【${ this.viewName }】:preShow` );
        }
        
        onPostShow (): void {
            console.log( `【${ this.viewName }】:postShow` );
            
        }
        
        onPreClose (): void {
            console.log( `【${ this.viewName }】: preClose` );
        }
        
        onPostClose (): void {
            console.log( `【${ this.viewName }】:postClose` );
        }
    }
}