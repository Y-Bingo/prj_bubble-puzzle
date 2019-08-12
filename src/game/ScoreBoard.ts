namespace view {
    
    const PROGRESS_SPEED    = 15;       // 进度条速度
    const PROGRESS_MAX_TIME = 600;      // 最大时间
    const PROGRESS_MIN_TIME = 100;      // 最小事件
    
    /**
     * 积分面板
     */
    export class ScoreBoard extends eui.Component {
        // 组件
        bl_lv: eui.BitmapLabel;         // 等级
        
        pg_trace: eui.Image;            // 进度条 轨迹
        pg_thumb: eui.Image;            // 进度条 高亮
        pg_thumb_mask: eui.Image;       // 进度条 高亮遮罩
        pg_star_1: eui.Component;       // 进度条 完成度 1
        pg_star_2: eui.Component;       // 进度条 完成度 2
        pg_star_3: eui.Component;       // 进度条 完成度 0
        
        bl_user_score: eui.BitmapLabel; // 玩家积分
        bl_max_score: eui.BitmapLabel;  // 满分积分
        
        // 属性
        private _lv: number;            // 关卡等级
        private _maxScore: number;      // 关卡积分
        private _userScore: number;     // 玩家积分
        private _scoreLv: number[];     // 游戏积分等级
        
        private _progress: number;      // 进度
        
        private _completion: number;   // 游戏完成度
        
        constructor () {
            super();
        }
        
        protected createChildren (): void {
            this.pg_thumb.mask = this.pg_thumb_mask;
        }
        
        // 设置游戏完成度标准
        private _setScoreLv ( value: number[] ): void {
            const self     = this;
            const maxWidth = self.pg_thumb.width;
            
            self._scoreLv    = value || df.SCORE_LV;
            // 设置星星的位置
            self.pg_star_1.x = self._scoreLv [ 0 ] / 100 * maxWidth;
            self.pg_star_2.x = self._scoreLv [ 1 ] / 100 * maxWidth;
            self.pg_star_3.x = self._scoreLv [ 2 ] / 100 * maxWidth;
        }
        
        // 获取用户分数
        getUserScore (): number { return this._userScore; }
        // 获取完成度
        getUserCompletion (): number { return this._completion; }
        
        // 游戏开始设置数据
        setData ( data: dt.ILVDt ): void {
            const self = this;
            self.reset();
            
            self._lv       = dt.dataMrg.getCurLv();
            self._maxScore = data.maxScore;
            
            self._setScoreLv( data.scoreLv );
            self._updateRes();
            self._updateStar();
        }
        
        // 游戏进度 value 为增量
        onProgress ( value: number ): void {
            const self      = this;
            const userScore = self._userScore;
            // 更新数据
            self._userScore = Math.min( value + userScore, self._maxScore );
            self._progress  = self._userScore / self._maxScore;
            for( let i = 0; i < self._scoreLv.length; i++ ) {
                if( self._progress * 100 < self._scoreLv[ i ] ) break;
                self._completion = i + 1;
            }
            
            const originX   = self.pg_thumb_mask.x;
            const targetX   = ( self._progress - 1 ) * self.pg_thumb_mask.width;
            const delayTime = Math.max(
                Math.min(
                    ( Math.floor( targetX - originX ) * PROGRESS_SPEED ), PROGRESS_MAX_TIME
                ), PROGRESS_MIN_TIME
            );
            
            egret.Tween.get( self.pg_thumb_mask )
                 .to( { x: targetX }, delayTime )
                 .call( () => {
                     self._updateStar();
                 } );
            
            this._updateRes();
        }
        
        // 重置
        reset (): void {
            const self       = this;
            // 初始化数据
            self._lv         = 0;
            self._maxScore   = 0;
            self._userScore  = 0;
            self._progress   = 0;
            self._completion = 0;
            // 移除动画
            egret.Tween.removeTweens( self.pg_thumb_mask );
        }
        
        private _updateRes (): void {
            const self              = this;
            self.bl_lv.text         = `${ self._lv }`;
            self.bl_max_score.text  = `${ self._maxScore }`;
            self.bl_user_score.text = `${ self._userScore }`;
            self.pg_thumb_mask.x    = ( self._progress - 1 ) * self.pg_thumb_mask.width;
        }
        
        private _updateStar (): void {
            for( let i = 1; i <= 3; i++ ) {
                if( i <= this._completion ) {
                    ( this[ `pg_star_${ i }` ] as eui.Component ).currentState = `star_${ i }_up`;
                } else {
                    ( this[ `pg_star_${ i }` ] as eui.Component ).currentState = `star_${ i }_down`;
                }
            }
        }
    }
}