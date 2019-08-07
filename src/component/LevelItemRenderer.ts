namespace ui {
    
    export class LevelItemRenderer extends eui.Component {
        
        // 组件
        l_level: eui.BitmapLabel;       // 关卡数字
        tg_star_1: eui.ToggleButton;    //
        tg_star_2: eui.ToggleButton;    //
        tg_star_3: eui.ToggleButton;    //
        
        data: any;
        
        constructor ( data: any ) {
            super();
            this.data     = data;
            this.skinName = skins.LevelItem;
        }
        
        protected childrenCreated (): void {
            this.dataChanged();
            console.log( this.data.lv );
        }
        
        setData ( data: any ): void {
            const { lv, completion } = data;
            if( this.data.lv !== lv && this.data.completion !== completion ) return;
            this.data = data;
            this.dataChanged();
        }
        
        protected dataChanged (): void {
            const { lv, completion } = this.data;
            this.l_level.text        = `${ lv }`;
            if( completion === 0 ) {
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