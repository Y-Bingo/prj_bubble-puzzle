namespace game {
    /**
     * 积分面板
     */
    export class ScoreBoard extends eui.Component {
        // 组件
        bl_lv: eui.BitmapLabel;         // 等级
        btn_pause: eui.Image;           // 暂停
        
        pg_trace: eui.Image;            // 进度条 轨迹
        pg_thumb: eui.Image;            // 进度条 高亮
        pg_thumb_mask: eui.Image;       // 进度条 高亮遮罩
        pg_star_0: eui.Component;       // 进度条 积分 0
        pg_star_1: eui.Component;       // 进度条 积分 1
        pg_star_2: eui.Component;       // 进度条 积分 2
        
        bl_user_score: eui.BitmapLabel; // 玩家积分
        bl_max_score: eui.BitmapLabel;  // 满分积分
        
        // 属性
        private _lv: number;            // 关卡等级
        private _maxScore: number;      // 关卡积分
        private _userScore: number;     // 玩家积分
        
        private _progress: number;      // 进度
        
        constructor () {
            super();
        }
        
        childrenCreated (): void {
            this.pg_thumb.mask = this.pg_thumb_mask;
            
            this.reset();
            
            this.btn_pause.addEventListener( egret.TouchEvent.TOUCH_TAP, this._onTouchTap, this );
        }
        
        private _onTouchTap (): void {
            console.log( '暂停' );
        }
        
        // 游戏开始设置数据
        setData ( lv: number, data: dt.ILVData ): void {
            this._lv        = lv;
            this._maxScore  = data.maxScore;
            this._userScore = 0;
            
            this._progress = Math.floor( ( this._userScore / this._maxScore ) * 100 ) / 100;
            
            this._update();
        }
        
        // 游戏进度
        onProgress ( userScore: number ): void {
            this._userScore += userScore;
            
            this._update();
        }
        
        // 重置
        reset (): void {
            this._lv        = 0;
            this._maxScore  = 0;
            this._userScore = 0;
            this._progress  = 0;
            
            this._update();
        }
        
        private _update (): void {
            this.bl_lv.text         = `${ this._lv }`;
            this.bl_max_score.text  = `${ this._maxScore }`;
            this.bl_user_score.text = `${ this._userScore }`;
            
            this.pg_thumb_mask.x = ( this._progress - 1 ) * this.pg_thumb_mask.width;
            
            this.pg_star_0.currentState = 'one_0';
            this.pg_star_1.currentState = 'two_0';
            this.pg_star_2.currentState = 'three_0';
            
            if( this._progress > 0.33 )
                this.pg_star_0.currentState = 'one_1';
            if( this._progress > 0.55 )
                this.pg_star_1.currentState = 'two_1';
            if( this._progress >= 1 )
                this.pg_star_2.currentState = 'three_1';
        }
    }
}