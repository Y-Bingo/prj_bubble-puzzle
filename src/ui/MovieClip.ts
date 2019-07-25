namespace mui {

    export interface IMovieClipData {
        sourceTemp?: string;    // 资源模版
        frameRate?: number;     // 帧频
        startFrame?: number;    // 开始帧
        endFrame?: number;      // 结束帧
        times?: number;         // 播放次数
        isLoop?: boolean;       // 是否循环播放
    }

    export class MovieClip extends eui.Image {

        // 配置属性
        private _sourceTemp: string;    // 资源模版
        private _frameRate: number;     // 帧频
        private _startFrame: number;    // 开始帧
        private _endFrame: number;      // 结束帧
        private _times: number;         // 播放次数
        private _isLoop: boolean;       // 是否循环

        // 其他内置属性
        private _curFrame: number;      // 当前帧
        private _interval: number;      // 间隔 = 1000 / 帧频
        private _timeCount: number;     // 播放次数计时

        constructor ( data: IMovieClipData ) {
            super();
            this._init( data );
            this.addEventListener( egret.Event.ADDED_TO_STAGE, this.__onAddToStage, this );
        }
        private _init ( data: IMovieClipData ): void {
            this._curFrame = 0;
            this._interval = ( 1000 / this._frameRate ) >> 0;

            this.frameRate = data.frameRate || 24;
            this.startFrame = data.startFrame || 0;
            this.endFrame = data.endFrame || 0;
            this.times = data.times || 1;
            this.isLoop = data.isLoop || false;
            this.sourceTemp = data.sourceTemp || "";
        }

        // 只读
        get curFrame () { return this._curFrame; }

        // 帧频
        get frameRate () { return this._frameRate; }
        set frameRate ( value ) {
            if ( value == null || this._frameRate == value ) return;
            this._frameRate = value;
            this._interval = ( 1000 / value ) >> 0;
        }
        // 开始帧
        get startFrame () { return this._startFrame; }
        set startFrame ( value: number ) {
            if ( value == null || this._startFrame == value ) return;
            this._startFrame = value;
        }
        // 结束帧
        get endFrame () { return this._endFrame; }
        set endFrame ( value: number ) {
            if ( value == null || this._endFrame == value ) return;
            this._endFrame = value;
        }
        // 播放次数
        get times () { return this._times; }
        set times ( value: number ) {
            if ( value == null || this._times === value ) return;
            this._times = value;
        }

        // 是否循环
        get isLoop () { return this._isLoop; }
        set isLoop ( value: boolean ) {
            if ( this._isLoop === value ) return;
            this._isLoop = value;
            if ( value ) {
                this.times = -1;
            }
        }

        // 资源模版
        get sourceTemp () { return this.sourceTemp; }
        set sourceTemp ( value: any ) {
            if ( !value || this._sourceTemp === value ) return;
            this._sourceTemp = value;
            // 赋值属性
            this._setTexture();
            // self.anchorOffsetX = txr.textureWidth / 2;
            // self.anchorOffsetY = txr.textureHeight / 2;
        }

        // 监听添加到舞台事件
        protected __onAddToStage ( e: egret.Event ): void {
            this.addEventListener( egret.Event.REMOVED_FROM_STAGE, this.__onRemoveFromStage, this );
        }

        // 监听移除舞台事件
        protected __onRemoveFromStage ( e: egret.Event ): void {
            this.stop();
        }

        private _setTexture ( frame: number = this._startFrame ): any {
            let self = this;
            let txr = null;
            let source = "";
            try {
                // 初始化
                source = self._sourceTemp.replace( "%f", frame + "" );
                txr = RES.getRes( source ) as egret.Texture;

                if ( !txr || txr.textureWidth <= 0 || txr.textureHeight <= 0 ) {
                    throw new Error( `帧动画的资源缺失: ${ source }` );
                }

                self.texture = txr;
            } catch ( e ) {
                if ( DEBUG ) {
                    egret.error( e );
                } else {
                    egret.warn( e );
                }
            }
        }

        // 播放
        private _call: Function;
        play ( callBack?: Function ): void {
            let self = this;

            // 验证
            if ( !self.parent ) {
                if ( DEBUG )
                    egret.warn( "该帧动画没有添加的舞台！" );
                return;
            };

            this._call = callBack;
            // 初始化
            self._timeCount = 0;
            self._frameEndTime = Date.now();
            self.addEventListener( egret.Event.ENTER_FRAME, self._play, self );
        }

        private _frameEndTime: number = 0;          // 上一针的结束时间
        private _frameStartTime: number = 0;        // 新一帧的开始时间
        private _deltaTime: number = 0;             // 帧间隔
        private _play (): void {
            let self = this;

            self._frameStartTime = Date.now();
            self._deltaTime = self._frameStartTime - self._frameEndTime;

            if ( self._deltaTime < self._interval ) return;
            if ( self._times >= 0 && self._timeCount >= self._times ) {
                self.stop();
                return;
            }

            // 更新结束时间
            self._frameEndTime = self._frameStartTime - ( self._deltaTime % self._interval );

            // 更新帧
            let frame = self._curFrame + self._startFrame;
            if ( frame >= self._endFrame ) {
                self._curFrame = 0;
                self._timeCount++;
            } else {
                self._curFrame++;
            }

            this._setTexture( frame );

            // 执行帧事件
            if ( this._frameEvent[ frame ] ) {
                this._frameEvent[ frame ]();
            }
        }

        private _frameEvent: { [ frame: number ]: Function } = {};
        bindFrameEvent ( frame: number, call: Function ): void {
            this._frameEvent[ frame ] = call;
        }

        // 将播放头指定到某一帧停止
        goAndStop ( frame: number ): void {
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
        gotoAndPlay ( frame: number ): void {
            let self = this;

            self._curFrame = frame;
            self.play();
        }

        // 将播放头移到前一一帧停止
        prevFrame (): void {
            let self = this;

            self._curFrame--;
            self.texture = RES.getRes( self._sourceTemp.replace( "%f", self._curFrame + "" ) );
        }

        // 停止
        stop (): void {
            let self = this;
            console.log( "1" );
            if ( self.hasEventListener( egret.Event.ENTER_FRAME ) )
                self.removeEventListener( egret.Event.ENTER_FRAME, self._play, self );
            // this._call && this._call();
            self.dispatchEventWith( egret.Event.COMPLETE );
        }
    }
}