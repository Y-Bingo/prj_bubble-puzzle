namespace view {
    /**
     * 积分面板
     */
    export class ScoreBoard extends eui.Component {
        // 组件
        bl_lv: eui.BitmapLabel;         // 等级
        
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
        private _scoreLv: number[];       // 游戏积分等级
        
        private _progress: number;      // 进度
        
        constructor () {
            super();
        }
        
        protected createChildren (): void {
            this.pg_thumb.mask = this.pg_thumb_mask;
        }
        
        // childrenCreated (): void {
        // }
        
        // 游戏开始设置数据
        setData ( data: dt.ILVData ): void {
            const self = this;
            self.reset();
            
            self._lv        = dt.dataMrg.getCurLv();
            self._maxScore  = data.maxScore;
            self._userScore = 0;
            
            self.setScoreLv( data.scoreLv );
            self._progress = Math.floor( ( this._userScore / this._maxScore ) * 100 ) / 100;
            self._updateRes();
        }
        
        setScoreLv ( value: number[] ): void {
            this._scoreLv = value || df.SCORE_LV;
            
            let maxWidth     = this.pg_thumb.width;
            // 设置星星的位置
            this.pg_star_0.x = this._scoreLv [ 0 ] / 100 * maxWidth;
            this.pg_star_1.x = this._scoreLv [ 1 ] / 100 * maxWidth;
            this.pg_star_2.x = this._scoreLv [ 2 ] / 100 * maxWidth;
            
            console.log( this.pg_star_0.x, this.pg_star_1.x, this.pg_star_2.x );
        }
        
        // 游戏进度
        onProgress ( value: number ): void {
            let userScore = this._userScore;
            
            this._userScore = Math.min( value + userScore, this._maxScore );
            this._progress  = this._userScore / this._maxScore;
            console.log( `获取积分：【${ value }】,积分更新：【${ this._userScore }】` );
            
            this._updateRes();
            
            let x = ( this._progress - 1 ) * this.pg_thumb_mask.width;
            egret.Tween.get( this.pg_thumb_mask ).to( { x: x }, 600 );
        }
        
        // 重置
        reset (): void {
            const self = this;
            
            self._lv                    = 0;
            self._maxScore              = 0;
            self._userScore             = 0;
            self._progress              = 0;
            self.pg_star_0.currentState = 'one_0';
            self.pg_star_1.currentState = 'two_0';
            self.pg_star_2.currentState = 'three_0';
            
            self.bl_lv.text         = `${ self._lv }`;
            self.bl_max_score.text  = `${ self._maxScore }`;
            self.bl_user_score.text = `${ self._userScore }`;
            self.pg_thumb_mask.x    = ( self._progress - 1 ) * self.pg_thumb_mask.width;
        }
        
        private _updateRes (): void {
            const self              = this;
            self.bl_lv.text         = `${ self._lv }`;
            self.bl_max_score.text  = `${ self._maxScore }`;
            self.bl_user_score.text = `${ self._userScore }`;
            
            if( self._progress * 100 > self._scoreLv[ 0 ] )
                self.pg_star_0.currentState = 'one_1';
            if( self._progress * 100 > self._scoreLv[ 1 ] )
                self.pg_star_1.currentState = 'two_1';
            if( self._progress * 100 >= self._scoreLv[ 2 ] )
                self.pg_star_2.currentState = 'three_1';
        }
    }
}