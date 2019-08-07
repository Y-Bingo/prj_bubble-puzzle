namespace ui {
    
    export class LevelItemRenderer extends eui.ItemRenderer {
        
        // 组件
        l_level: eui.BitmapLabel;       // 关卡数字
        tg_star_1: eui.ToggleButton;    //
        tg_star_2: eui.ToggleButton;    //
        tg_star_3: eui.ToggleButton;    //
        
        constructor () {
            super();
            this.skinName = skins.LevelItem;
        }
        
        setData ( data: any ): void {
            const { lv, completion } = data;
            if( this.data.lv !== lv && this.data.completion !== completion ) return;
            this.data = data;
            this.dataChanged();
        }
        
        protected dataChanged (): void {
            const { lv, completion, bLock } = this.data;
            this.l_level.text               = `${ lv }`;
            if( bLock ) {
                this.currentState = 'lock'
            } else {
                this.currentState = 'unlock';
                for( let i = 0; i < 3; i++ ) {
                    if( i < completion )
                        ( this[ 'tg_star_' + ( i + 1 ) ] as eui.ToggleButton ).selected = true;
                    else
                        ( this[ 'tg_star_' + ( i + 1 ) ] as eui.ToggleButton ).selected = false;
                }
            }
        }
    }
}