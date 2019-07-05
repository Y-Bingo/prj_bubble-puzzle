namespace ui
{
    /**
     * 箭头 
     */
    export class Arrow extends eui.Image
    {
        private _value: df.BubbleType;

        constructor ()
        {
            super();
            this.anchorOffsetX = 19;
            this.anchorOffsetY = 80;
        }

        setValue ( val: df.BubbleType )
        {
            if ( val == this._value ) return;
            this._value = val;

            this._updateRes();
        }

        private _updateRes (): void
        {
            let res = "";
            switch ( this._value ) {
                case df.BubbleType.RED: res = "arrow_red_png"; break;
                case df.BubbleType.YELLOW: res = "arrow_yellow_png"; break;
                case df.BubbleType.BLUE: res = "arrow_blue_png"; break;
                case df.BubbleType.GREEN: res = "arrow_green_png"; break;
                case df.BubbleType.ORANGE: res = "arrow_orange_png"; break;
                case df.BubbleType.PINK: res = "arrow_pink_png"; break;
                case df.BubbleType.PURPLE: res = "arrow_purple_png"; break;
                default: res = "arrow_white_png"; break;
            }
            this.source = RES.getRes( res );
        }

        // 旋转
        rotate ( angle: number ): void
        {
            if ( !this.visible ) return;

            // angle = Math.min( df.MAX_ANGLE, angle );
            // angle = Math.max( df.MIN_ANGLE, angle );

            this.rotation = angle;
        }

        show ( angle: number ): void
        {
            this.visible = true;
            this.rotate( angle );
        }

        hide (): void
        {
            this.visible = false;
            this.rotation = 0;
        }

        reset (): void
        {
            this.rotation = 0;
        }
    }
}
