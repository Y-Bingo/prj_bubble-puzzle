namespace view {
    
    interface IShopItem extends eui.Component {
        tool: IToolItem;
        bl_cost: eui.BitmapLabel;
        bl_count: eui.BitmapLabel;
    }
    
    export class ShopPage extends eui.Component implements IView {
        viewName: string    = 'ShopPage';
        viewType: EViewType = EViewType.PAGE;
        
        // 组件
        l_coin: eui.Label;
        // 组
        c_hummer: IShopItem;
        c_bomb: IShopItem;
        c_color: IShopItem;
        c_guid: IShopItem;
        // 按钮
        btn_return: eui.Button;
        btn_pay: eui.Button;
        btn_add: eui.Button;        // 增
        btn_min: eui.Button;        // 减
        g_btns: eui.Group;          //
        g_tool: eui.Group;
        
        // 属性
        private _curOperate: IShopItem;     // 当前操作的对象
        private _totalCost: number;         // 总花费
        
        constructor () {
            super();
            this.skinName = skins.ShopPage;
        }
        
        protected createChildren (): void {
            if( this.g_btns.parent ) {
                this.g_btns.parent.removeChild( this.g_btns );
            }
        }
        
        // 添加事件
        private _addEventListener (): void {
            this.btn_return.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnReturn, this );
            this.btn_add.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnAdd, this );
            this.btn_min.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnMin, this );
            this.btn_pay.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnPay, this );
            this.g_tool.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onSelectTool, this );
        }
        
        private _onBtnReturn (): void {
            viewMrg.showPage( 'MenuPage', { effectType: ui.BOUNCE_EN.RIGHT } )
        }
        
        private _onBtnAdd (): void {
            let count = Math.min( 100, Number( this._curOperate.bl_count.text ) + 1 );
            let cost  = count * df.TOOL_PRICE[ this._curOperate.currentState ];
            
            this._curOperate.bl_count.text = `${ count }`;
            this._curOperate.bl_cost.text  = `${ cost }`;
            this._updatePay();
        }
        
        private _onBtnMin (): void {
            let count = Math.max( 0, Number( this._curOperate.bl_count.text ) - 1 );
            let cost  = count * df.TOOL_PRICE[ this._curOperate.currentState ];
            
            this._curOperate.bl_count.text = `${ count }`;
            this._curOperate.bl_cost.text  = `${ cost }`;
            this._updatePay();
        }
        
        private _onBtnPay (): void {
            // 更新数据
            const countHummer = Number( this.c_hummer.bl_count.text );
            const countBomb   = Number( this.c_bomb.bl_count.text );
            const countColor  = Number( this.c_color.bl_count.text );
            const countGuid   = Number( this.c_guid.bl_count.text );
            
            dt.dataMrg.updateToolCount( 'hummer', countHummer );
            dt.dataMrg.updateToolCount( 'bomb', countBomb );
            dt.dataMrg.updateToolCount( 'color', countColor );
            dt.dataMrg.updateToolCount( 'guid', countGuid );
            
            dt.dataMrg.updateCoin( -this._totalCost );
            
            this._updateBtns( false );
            
            this._updateCost();
            this._updateCount();
            this._updateTool();
            this._updateCoin();
            this._updatePay();
            
            console.log( 'pay', this._totalCost );
            this._totalCost = 0;
        }
        
        private _onSelectTool ( evt: egret.TouchEvent ): void {
            const self = this;
            
            if( self._curOperate === evt.target ) {
                self._curOperate = null;
                self._updateBtns( false );
                return;
            }
            
            self._curOperate = evt.target;
            self._updateBtns( true );
        }
        
        // 移除事件
        private _removeEventListener (): void {
            this.btn_return.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnReturn, this );
            this.btn_add.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnAdd, this );
            this.btn_min.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnMin, this );
            this.btn_pay.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onBtnPay, this );
            this.g_tool.removeEventListener( egret.TouchEvent.TOUCH_TAP, this._onSelectTool, this );
        }
        
        private _updateCost (): void {
            this.c_hummer.bl_cost.text = '0';
            this.c_bomb.bl_cost.text   = '0';
            this.c_color.bl_cost.text  = '0';
            this.c_guid.bl_cost.text   = '0';
        }
        
        private _updateCount (): void {
            this.c_hummer.bl_count.text = `${ 0 }`;
            this.c_bomb.bl_count.text   = `${ 0 }`;
            this.c_color.bl_count.text  = `${ 0 }`;
            this.c_guid.bl_count.text   = `${ 0 }`;
        }
        
        private _updateTool (): void {
            const toolCount                = dt.dataMrg.getToolCount();
            this.c_hummer.tool.bl_num.text = `${ toolCount.hummer }`;
            this.c_bomb.tool.bl_num.text   = `${ toolCount.bomb }`;
            this.c_color.tool.bl_num.text  = `${ toolCount.color }`;
            this.c_guid.tool.bl_num.text   = `${ toolCount.guid }`;
        }
        
        private _updatePay (): void {
            let disable       = false;
            const countHummer = Number( this.c_hummer.bl_count.text );
            const countBomb   = Number( this.c_bomb.bl_count.text );
            const countColor  = Number( this.c_color.bl_count.text );
            const countGuid   = Number( this.c_guid.bl_count.text );
            if( countHummer == 0 &&
                countBomb == 0 &&
                countColor == 0 &&
                countGuid == 0 ) {
                disable = true;
            }
            
            const totalCost =
                      countHummer * df.TOOL_PRICE.hummer +
                      countGuid * df.TOOL_PRICE.guid +
                      countBomb * df.TOOL_PRICE.bomb +
                      countColor * df.TOOL_PRICE.color;
            if( totalCost > dt.dataMrg.getCoin() ) {
                disable = true;
            }
            
            this._totalCost      = totalCost;
            this.btn_pay.enabled = !disable;
        }
        
        private _updateCoin (): void {
            // 更新金币
            this.l_coin.text = `${ dt.dataMrg.getCoin() }`;
        }
        
        private _updateBtns ( isShow: boolean ): void {
            if( isShow ) {
                if( !this.g_btns.parent )
                    this.addChild( this.g_btns );
                this.g_btns.y = this.g_tool.y + this._curOperate.y + 4;
            } else {
                if( this.g_btns.parent )
                    this.g_btns.parent.removeChild( this.g_btns );
            }
        }
        
        public onPreShow (): void {
            this._addEventListener();
            this._updateBtns( false );
            this._updateCost();
            this._updateCount();
            this._updateTool();
            this._updatePay();
            this._updateCoin();
        }
        
        public onPreClose (): void {
            this._removeEventListener();
        }
    }
    
}