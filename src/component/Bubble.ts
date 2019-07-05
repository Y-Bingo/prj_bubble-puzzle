namespace ui
{
    export class Bubble extends eui.Component 
    {
        // 物理属性
        g: number;          // 重力加速度
        angle: number;      // 发射角度
        speedX: number;     // 速度偏移X
        speedY: number;     // 速度偏移Y
        // 游戏属性
        row: number;        // 行坐标
        col: number;        // 纵坐标
        value: df.BubbleType;  // 泡泡值
        // 组件
        outSide: eui.Image; // 外部

        constructor ()
        {
            super();

            this.width = df.RADIUS * 2;
            this.height = df.RADIUS * 2;
            this.anchorOffsetX = df.RADIUS;
            this.anchorOffsetY = df.RADIUS;

            this._initProp();

            this.reset();
        }

        private _initProp (): void
        {
            // 初始化组件
            let outSide = new eui.Image();
            this.outSide = outSide;
            outSide.width = this.width;
            outSide.height = this.height;
            this.addChild( outSide );
        }

        setValue ( val: df.BubbleType )
        {
            if ( this.value == val ) return;
            this.value = val;
            // this.source = null;
            this._updateRes();
        }

        setAngle ( angle: number )
        {
            if ( angle > df.MAX_ANGLE || angle < df.MIN_ANGLE ) return;
            this.angle = angle;
            this.speedY = - df.BUBBLE_FLY_SPEED;
            this.speedX = Math.tan( angle * Math.PI / 180 ) * df.BUBBLE_FLY_SPEED;
        }

        stop (): void
        {
            this.speedX = 0;
            this.speedY = 0;
            this.angle = 0;
            this.g = 0;
        }

        private _updateRes (): void
        {
            this.outSide.source = df.BubbleResMap[ this.value as string ];
        }

        reset (): void
        {
            // 初始化属性
            this.g = 0;
            this.angle = 0;
            this.speedX = 0;
            this.speedY = 0;
            this.row = -1;
            this.col = -1;

            this.value = df.BubbleType.NONE;
        }
    }

    // export class Bubble extends eui.Component implements IBubble {
    // 	// 泡泡球
    // 	bubble_img: eui.Image;
    // 	// 指针
    // 	arrow: eui.Image;
    // 	// 泡泡值
    // 	value: BUBBLE_VALUE;
    // 	// 行坐标
    // 	row: number;
    // 	// 纵坐标
    // 	col: number;
    // 	// 布局X坐标偏移量
    // 	private _offsetX: number;
    // 	// 速度偏移X
    // 	speedX: number;
    // 	// 速度偏移Y
    // 	speedY: number;
    // 	// 重力加速度
    // 	g: number;
    // 	// 发射角度
    // 	angle: number;
    // 	// 模型
    // 	public _model: IModel;
    // 	// 周边的球
    // 	neighborhoods: BubbleIndex[];

    // 	constructor( value?: BUBBLE_VALUE, row?: number, col?: number ) {
    // 		super();
    // 		this.value = value;
    // 		this.speedX = 0;
    // 		this.speedY = 0;
    // 		this.g = 0;
    // 		this.row = row !== undefined ? row : NaN;
    // 		this.col = col !== undefined ? col : NaN;
    // 		this.neighborhoods = this.getNeighborhoods();
    // 		this.bubble_img = new eui.Image();
    // 		this.addChild( this.bubble_img );
    // 		this.addEventListener( eui.UIEvent.ADDED_TO_STAGE, this.initUI, this );
    // 	}

    // 	reset( value?: BUBBLE_VALUE, row?: number, col?: number ): void {
    // 		this.value = value;
    // 		this.speedX = 0;
    // 		this.speedY = 0;
    // 		this.g = 0;
    // 		this.row = row !== undefined ? row : NaN;
    // 		this.col = col !== undefined ? col : NaN;
    // 		this.neighborhoods = this.getNeighborhoods();
    // 		this.initUI();
    // 	}

    // 	private initUI() {
    // 		this.bubble_img.source = RES.getRes( BUBBLE_RES_KEY[ this.value ] );
    // 		this._offsetX = this.row % 2 !== 0 ? this.width / 2 : 0;
    // 		this.x = this.col * this.bubble_img.width + this._offsetX;
    // 		this.y = this.row * ( this.bubble_img.height - 6 );
    // 	}

    // 	get index() {
    // 		return `( ${ this.row }, ${ this.col } )`;
    // 	}

    // 	get model() {
    // 		// if( this._model ) return this._model;
    // 		let radius = this.width / 2,
    // 			centerX = this.x + radius,
    // 			centerY = this.y + radius;
    // 		this._model = { radius, centerX, centerY };
    // 		return this._model;
    // 	}

    // 	private getNeighborhoods(): BubbleIndex[] {
    // 		let row = this.row,
    // 			col = this.col,
    // 			// 左边位置
    // 			offsetLeft = ( Math.abs( row ) + 1 ) % 2,
    // 			// 右边偏移位置
    // 			offsetRight = ( Math.abs( row )  ) % 2,
    // 			// 附近六个球的坐标
    // 			bounding: BubbleIndex[] = [
    // 				[ row - 1, col - offsetLeft ], [ row - 1, col + offsetRight ],
    // 				[ row, col - 1 ], [ row, col + 1 ],
    // 				[ row + 1, col - offsetLeft ], [ row + 1, col + offsetRight ],
    // 			];
    // 		// 根据当前泡泡的位置，过滤掉不符合规则的泡泡边境位置
    // 		bounding = bounding.filter( ( bubbleIndex, i ) => {
    // 			return !(
    // 				bubbleIndex[ 1 ] < 0 ||
    // 				bubbleIndex[ 1 ] >= MAX_COL - bubbleIndex[ 0 ] % 2 ||
    // 				bubbleIndex[ 0 ] < -1 );
    // 		} );
    // 		return bounding;
    // 	} 

    // 	public showArrow( angle?: number ): void {
    // 		if ( !this.arrow || !this.parent ) {
    // 			this.arrow = new eui.Image( ARROW_RES_KEY[ this.value ] );
    // 			this.addChild( this.arrow );
    // 			this.swapChildren( this.arrow, this.bubble_img );
    // 			this.arrow.anchorOffsetX = this.arrow.width / 2;
    // 			this.arrow.x = ( this.bubble_img.width ) / 2;
    // 			this.arrow.anchorOffsetY = 80;
    // 			this.arrow.y = this.bubble_img.height / 2;
    // 		}
    // 		if ( !this.arrow.parent ) {
    // 			this.addChild( this.arrow );
    // 			this.swapChildren( this.arrow, this.bubble_img );
    // 		}
    // 		this.arrow.rotation = angle === undefined ? 0 : angle;
    // 		this.angle = this.arrow.rotation;
    // 	}

    // 	public hideArrow(): void {
    // 		this.removeChild( this.arrow );
    // 	}
    // }


}