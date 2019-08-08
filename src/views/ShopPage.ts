namespace view {
    
    export class ShopPage extends eui.Component implements IView {
        viewName: string    = 'ShopPage';
        viewType: EViewType = EViewType.PAGE;
        
        // 组件
        l_coin: eui.Label;
        // 组
        g_hummer: eui.Group;
        g_bomb: eui.Group;
        g_color: eui.Group;
        g_guid: eui.Group;
        // 道具
        tool_hummer: IToolItem;
        tool_bomb: IToolItem;
        tool_color: IToolItem;
        tool_guid: IToolItem;
        // 花费金额
        bl_cost_hummer: eui.BitmapLabel;
        bl_cost_bomb: eui.BitmapLabel;
        bl_cost_color: eui.BitmapLabel;
        bl_cost_guid: eui.BitmapLabel;
        // 购买数量
        bl_count_hummer: eui.BitmapLabel;
        bl_count_bomb: eui.BitmapLabel;
        bl_count_color: eui.BitmapLabel;
        bl_count_guid: eui.BitmapLabel;
        // 按钮
        btn_return: eui.Button;
        btn_pay: eui.Button;
        btn_add: eui.Button;        // 增
        btn_min: eui.Button;        // 减
        g_btns: eui.Group;          //
        g_tool: eui.Group;
        
        // 属性
        private _curOperate: eui.BitmapLabel;   // 当前操作的对象
        private _buyCount: {
            hummer?: number;
            color?: number;
            bomb?: number;
            guid?: number;
        } = {};
        
        constructor () {
            super();
            this.skinName = skins.ShopPage;
        }
        
        protected createChildren (): void {
            if( this.g_btns.parent ) {
                this.g_btns.parent.removeChild( this.g_btns );
            }
            
            this.g_hummer.touchChildren = false;
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
            let value             = Number( this._curOperate.text );
            value                 = Math.min( 100, value + 1 );
            this._curOperate.text = `${ value }`;
            this._updatePay();
        }
        
        private _onBtnMin (): void {
            let value             = Number( this._curOperate.text );
            value                 = Math.max( 0, value - 1 );
            this._curOperate.text = `${ value }`;
            this._updatePay();
        }
        
        private _onBtnPay (): void {
            console.log( 'pay' );
        }
        
        private _onSelectTool ( evt: egret.TouchEvent ): void {
            const self = this;
            
            if( self._curOperate === evt.target ) {
                if( self.g_btns.parent )
                    self.g_btns.parent.removeChild( self.g_btns );
                return;
            }
            
            switch( evt.target ) {
                case self.g_bomb:
                    self._curOperate = self.bl_count_bomb;
                    break;
                case self.g_hummer:
                    self._curOperate = self.bl_count_hummer;
                    break;
                case self.g_color:
                    self._curOperate = self.bl_count_color;
                    break;
                case self.g_guid:
                    self._curOperate = self.bl_count_guid;
                    break;
                default:
                    break;
            }
            
            if( !self.g_btns.parent )
                self.addChild( self.g_btns );
            self.g_btns.y = self.g_tool.y + evt.target.y + 4;
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
            this.bl_cost_hummer.text = '0';
            this.bl_cost_bomb.text   = '0';
            this.bl_cost_color.text  = '0';
            this.bl_cost_guid.text   = '0';
        }
        
        private _updateCount (): void {
            this._buyCount.bomb       = 0;
            this._buyCount.hummer     = 0;
            this._buyCount.color      = 0;
            this._buyCount.guid       = 0;
            this.bl_count_hummer.text = `${ this._buyCount.hummer }`;
            this.bl_count_bomb.text   = `${ this._buyCount.bomb }`;
            this.bl_count_color.text  = `${ this._buyCount.color }`;
            this.bl_count_guid.text   = `${ this._buyCount.guid }`;
        }
        
        private _updateTool (): void {
            const toolCount              = dt.dataMrg.getToolCount();
            this.tool_hummer.bl_num.text = `${ toolCount.hummer }`;
            this.tool_bomb.bl_num.text   = `${ toolCount.bomb }`;
            this.tool_color.bl_num.text  = `${ toolCount.color }`;
            this.tool_guid.bl_num.text   = `${ toolCount.guid }`;
        }
        
        private _updatePay (): void {
            let disable       = false;
            const countHummer = Number( this.bl_count_hummer.text );
            const countBomb   = Number( this.bl_count_bomb.text );
            const countColor  = Number( this.bl_count_color.text );
            const countGuid   = Number( this.bl_count_guid.text );
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
            // this.btn_pay.touchEnabled = !disable;
            this.btn_pay.enabled = !disable;
        }
        
        public onPreShow (): void {
            this._addEventListener();
            this._updateCost();
            this._updateCount();
            this._updateTool();
            this._updatePay();
            // 更新金币
            this.l_coin.text = `${ dt.dataMrg.getCoin() }`;
        }
        
        public onPreClose (): void {
            this._removeEventListener();
        }
    }
    
}