namespace view {
    
    interface IComboSkinPart extends eui.Component {
        icon_combo: eui.Image;      // combo标志
        bl_combo: eui.BitmapLabel;  // bl_combo
    }
    
    const GOOD_RES = [ 'result_wenzikubile_png', 'result_wenzishuaidaile_png', 'result_wenzizhenbang_png', 'result_wenzizhenlihai_png' ];
    
    export class ComboEffectHandler {
        
        private _res: eui.Group;                // 父容器
        
        private _comboPool: IComboSkinPart[];   // combo 显示对象池
        private _goodPool: eui.Image[];         // 点赞显示对象池
        
        private _comBoCount: number;             // 连击计数
        
        constructor ( res: eui.Group ) {
            this._res = res;
            this._res.removeChildren();
            
            this._comBoCount = 0;
            this._initCombo();
            this._initGood();
        }
        
        private _initCombo (): void {
            this._comboPool = [];
            this._comboPool.push( this._createComEffect() );
            this._comboPool.push( this._createComEffect() );
        }
        
        private _initGood (): void {
            this._goodPool = [];
            for( let i = 0; i < GOOD_RES.length; i++ ) {
                this._goodPool.push( new eui.Image( GOOD_RES[ i ] ) );
            }
        }
        
        showCombo ( combo: number, point: egret.Point ): void {
            if( combo < 3 ) {
                this._comBoCount = Math.max( 0, this._comBoCount - 1 );
                return;
            } else {
                this._comBoCount++;
                this._showGood();
            }
            
            if( !this._comboPool.length ) return;
            const self                = this;
            const comboEffect         = self._getComboEffect();
            comboEffect.bl_combo.text = `${ combo }`;
            
            comboEffect.y = point.y - df.RADIUS * 2;
            comboEffect.x = point.x;
            
            self._res.addChild( comboEffect );
            egret.Tween.get( comboEffect )
                 .to( { alpha: 1, scaleX: 1, scaleY: 1 }, 150, egret.Ease.bounceIn )
                 .wait( 1000 )
                 .to( { alpha: .2, scaleX: 0, scaleY: 0 }, 800 )
                 .call( () => {
                     egret.Tween.removeTweens( comboEffect );
                     self._res.removeChild( comboEffect );
                     comboEffect.alpha = 1;
                     self._comboPool.unshift( comboEffect );
                 } );
        }
        
        private _showGood (): void {
            const self = this;
            if( self._comBoCount < 3 ) return;
            
            const index      = ( self._comBoCount / 3 ) >> 0;
            const maxHeight  = self._res.height - 100;
            const effectGood = self._goodPool[ index ];
            const randomY    = Math.floor( Math.random() * maxHeight ) + 50;
            if( effectGood.parent ) return;
            if( self._comBoCount >= 9 ) {
                self._comBoCount = 0;
            }
            self._comBoCount++;
            
            effectGood.y = randomY;
            effectGood.x = this._res.width;
            
            self._res.addChild( effectGood );
            egret.Tween.get( effectGood )
                 .to( { x: -effectGood.width }, 2000 )
                 .call( () => {
                     egret.Tween.removeTweens( effectGood );
                     self._res.removeChild( effectGood );
                 } )
        }
        
        private _getComboEffect (): IComboSkinPart {
            if( this._comboPool.length ) {
                return this._comboPool.pop();
            }
            return this._createComEffect();
        }
        
        private _createComEffect (): IComboSkinPart {
            const com         = new eui.Component();
            com.skinName      = skins.ComboEffectItem;
            com.currentState  = ( this._res.numElements + this._comboPool.length ) % 2 ? 'purple' : 'blue';
            com.anchorOffsetX = 85;
            com.anchorOffsetY = 44;
            return com as IComboSkinPart;
        }
        
        // 回收
        reset (): void {
            this._comBoCount = 0;
            for( let i = 0; i < this._res.numElements; i++ ) {
                egret.Tween.removeTweens( this._res.getElementAt( i ) );
            }
            this._res.removeChildren();
        }
    }
    
}