namespace ui
{
    export class MovieClip extends eui.Image
    {
        private _curFrame: number = 1;          // 当前帧
        private _frameRate: number = 24;        // 帧频

        private _startFrame: number = 0;        // 开始帧
        private _endFrame: number = 0;          // 结束帧

        private _interval: number;              // 间隔 = 1000 / 帧频

        private _isLoop: boolean = false;       // 是否循环

        // private _curSprite: eui.Image = null;   // 当前的显示的精灵
        // private _curSource: string = "";        // 资源名
        private _sourceTemp: string = "";       // 资源模版

        constructor ()
        {
            super();
            // this._curSprite = new eui.Image();
            // this.addChild( this._curSprite );
            this._interval = ( 1000 / this._frameRate ) >> 0;
            this.addEventListener( egret.Event.ADDED_TO_STAGE, this.__onAddToStage, this );
        }
        // 只读
        get curFrame () { return this._curFrame; }

        // 帧频
        get frameRate () { return this._frameRate; }
        set frameRate ( value )
        {
            if ( this._frameRate == value ) return;
            this._frameRate = value;
            this._interval = ( 1000 / value ) >> 0;
        }
        // 开始帧
        get startFrame () { return this._startFrame; }
        set startFrame ( value: number )
        {
            if ( this._startFrame == value ) return;
            this._startFrame = value;
        }
        // 结束帧
        get endFrame () { return this._endFrame; }
        set endFrame ( value: number )
        {
            if ( this._endFrame == value ) return;
            this._endFrame = value;
        }

        get sourceTemp () { return this.sourceTemp; }
        set sourceTemp ( value: any )
        {
            if ( this._sourceTemp === value ) return;

            let self = this;
            // 赋值属性
            self._sourceTemp = value;

            try {
                // 初始化
                let source = self._sourceTemp.replace( "%f", self._curFrame + "" );
                self.texture = RES.getRes( source );

                if ( !self.texture || self.texture.textureWidth <= 0 || self.texture.textureHeight <= 0 ) {
                    if ( DEBUG )
                        egret.warn( `帧动画的资源缺失: ${ source }` );
                    return;
                }
                self.anchorOffsetX = self.texture.textureWidth / 2;
                self.anchorOffsetY = self.texture.textureHeight / 2;
            } catch ( e ) {

            }
        }

        // 监听添加到舞台事件
        protected __onAddToStage ( e: egret.Event ): void
        {
            let self = this;

            self.addEventListener( egret.Event.REMOVED_FROM_STAGE, self.__onRemoveFromStage, self );
        }

        // 监听移除舞台事件
        protected __onRemoveFromStage ( e: egret.Event ): void
        {
            this.stop();
        }

        // 播放
        play (): void
        {
            let self = this;

            if ( !self.parent ) {
                if ( DEBUG )
                    egret.warn( "该帧动画没有添加的舞台！" );
                return;
            };

            // 初始化
            let source = self._sourceTemp.replace( "%f", self._curFrame + "" );
            self._frameEndTime = Date.now();
            self.texture = RES.getRes( source );

            if ( self.texture.textureWidth <= 0 || self.texture.textureHeight <= 0 ) {
                if ( DEBUG )
                    egret.warn( `帧动画的资源缺失: ${ source }` );
                return;
            }

            this.addEventListener( egret.Event.ENTER_FRAME, self._play, self );
        }

        private _frameEndTime: number = 0;          // 上一针的结束时间
        private _frameStartTime: number = 0;        // 新一帧的开始时间
        private _deltaTime: number = 0;             // 帧间隔
        private _play (): void
        {
            let self = this;

            self._frameStartTime = Date.now();
            self._deltaTime = self._frameStartTime - self._frameEndTime;
            if ( self._deltaTime < self._interval ) return;
            // 更新结束时间
            self._frameEndTime = self._frameStartTime - ( self._deltaTime % self._interval );
            // 更新帧
            self._curFrame++;
            if ( self._curFrame > self._endFrame )
                self._curFrame = self._startFrame;

            self.texture = RES.getRes( self._sourceTemp.replace( "%f", self.curFrame + "" ) );
        }

        // 将播放头指定到某一帧停止
        goAndStop ( frame: number ): void
        {
            let self = this;
            let source = self._sourceTemp.replace( "%f", self._curFrame + "" );

            self._curFrame = frame;
            self.texture = RES.getRes( source );

            if ( self.texture.textureWidth <= 0 || self.texture.textureHeight <= 0 ) {
                if ( DEBUG )
                    egret.warn( `帧动画的资源缺失: ${ source }` );
            }

            self.stop();
        }

        // 将播放头指定到某一帧开始
        gotoAndPlay ( frame: number ): void
        {
            let self = this;

            self._curFrame = frame;
            self.play();
        }

        // 将播放头移到前一一帧停止
        prevFrame (): void
        {
            let self = this;

            self._curFrame--;
            self.texture = RES.getRes( self._sourceTemp.replace( "%f", self._curFrame + "" ) );
        }

        // 停止
        stop (): void
        {
            let self = this;

            if ( self.hasEventListener( egret.Event.ENTER_FRAME ) )
                self.removeEventListener( egret.Event.ENTER_FRAME, self._play, self );
        }

    }
}
