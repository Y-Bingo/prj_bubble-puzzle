namespace ui {
    export enum BOUNCE_EN {
        // 没有动画
        NONE    = 0,
        // 从中间轻微弹出
        IN      = 1,
        // 从中间猛烈弹出
        IN_RUDE = 2,
        // 从左到右
        LEFT    = 3,
        // 从右刀座
        RIGHT   = 4,
        // 从上到下
        UP      = 5,
        // 从下到上
        DOWN    = 6
    }
    
    export enum BOUNCE_EX {
        // 没有动画
        NONE  = 0,
        // 从中间消失
        OUT   = 1,
        // 从左到右
        LEFT  = 3,
        // 从右向左
        RIGHT = 4,
        // 从上到下
        UP    = 5,
        // 从下到上
        DOWN  = 6
    }
    
    export const BOUNCE_EX_MAP = {
        [ BOUNCE_EN.NONE ]: BOUNCE_EX.NONE,
        // 从中间轻微弹出
        [ BOUNCE_EN.IN ]: BOUNCE_EX.OUT,
        // 从中间猛烈弹出
        [ BOUNCE_EN.IN_RUDE ]: BOUNCE_EX.OUT,
        // 从左到右
        [ BOUNCE_EN.LEFT ]: BOUNCE_EX.LEFT,
        // 从右刀座
        [ BOUNCE_EN.RIGHT ]: BOUNCE_EX.RIGHT,
        // 从上到下
        [ BOUNCE_EN.UP ]: BOUNCE_EX.UP,
        // 从下到上
        [ BOUNCE_EN.DOWN ]: BOUNCE_EX.DOWN
    }
    
    export interface IAmShowOptions {
        // 进入特效
        effectType?: BOUNCE_EN,
        // 是否需要黑色背景
        dark?: boolean,
        // 指定弹窗宽度，定位使用
        popUpWidth?: number,
        // 指定弹窗高度，定位使用
        popUpHeight?: number,
        
        isAlert?: boolean
    }
    
    export interface IAmCloseOptions {
        // 退出特效
        effectType?: BOUNCE_EX,
    }
    
    /**
     * 动画装饰器模式
     */
    export class Am {
        // 灰色遮罩层
        static darkSprite: egret.Sprite;
        
        /**
         *
         * @param rootView 父节点
         * @param view
         * @param options
         */
        static showPanel ( rootView: egret.DisplayObjectContainer, view: egret.DisplayObject, options: IAmShowOptions = {} ) {
            let effectType: BOUNCE_EN = options.effectType || BOUNCE_EN.NONE,
                dark: boolean         = options.dark || false,
                popUpWidth: number    = options.popUpWidth || 0,
                popUpHeight: number   = options.popUpHeight || 0,
                isAlert: boolean      = options.isAlert || true
            if( rootView.contains( view ) )
                return;
            // 是否添加阴影
            if( dark ) {
                let darkSprite = new egret.Sprite();
                darkSprite.graphics.clear();
                darkSprite.graphics.beginFill( 0x000000, 0.3 );
                darkSprite.graphics.drawRect( 0, 0, rootView.width, rootView.height );
                darkSprite.graphics.endFill();
                darkSprite.width  = rootView.width;
                darkSprite.height = rootView.height;
                if( !rootView.contains( darkSprite ) ) {
                    rootView.addChild( darkSprite );
                }
                darkSprite.touchEnabled = true;
                egret.Tween.get( darkSprite ).to( { alpha: 1 }, 150 );
                darkSprite.visible = true;
                Am.darkSprite      = darkSprite;
            }
            // 添加面版
            if( !rootView.contains( view ) )
                rootView.addChild( view );
            
            if( popUpWidth == 0 ) {
                popUpWidth  = view.width;
                popUpHeight = view.height;
            }
            // 初始化
            view.alpha        = 1;
            view.scaleX       = 1;
            view.scaleY       = 1;
            view.x            = rootView.width / 2 - popUpWidth / 2;
            view.y            = rootView.height / 2 - popUpHeight / 2;
            //以下是弹窗动画
            var leftX: number = rootView.width / 2 - popUpWidth / 2;
            var upY: number   = rootView.height / 2 - popUpHeight / 2;
            
            switch( effectType ) {
                case 0:
                    break;
                case 1:
                    view.alpha  = 0;
                    view.scaleX = 0.5;
                    view.scaleY = 0.5;
                    view.x      = view.x + popUpWidth / 4;
                    view.y      = view.y + popUpHeight / 4;
                    egret.Tween.get( view ).to( {
                        alpha: 1,
                        scaleX: 1,
                        scaleY: 1,
                        x: view.x - popUpWidth / 4,
                        y: view.y - popUpHeight / 4
                    }, 300, egret.Ease.backOut );
                    break;
                case 2:
                    view.alpha  = 0;
                    view.scaleX = 0.5;
                    view.scaleY = 0.5;
                    view.x      = view.x + popUpWidth / 4;
                    view.y      = view.y + popUpHeight / 4;
                    egret.Tween.get( view ).to( {
                        alpha: 1,
                        scaleX: 1,
                        scaleY: 1,
                        x: view.x - popUpWidth / 4,
                        y: view.y - popUpHeight / 4
                    }, 600, egret.Ease.elasticOut );
                    break;
                case 3:
                    if( isAlert ) {
                        view.x = -popUpWidth;
                        egret.Tween.get( view ).to( {
                            x: leftX,
                            alpha: 1
                        }, 500, egret.Ease.cubicOut ).call( () => {
                            console.log( view.alpha, view.x, view.y, rootView.width, rootView.height );
                        } );
                    } else {
                        view.x = -popUpWidth;
                        egret.Tween.get( view ).to( { x: 0 }, 500, egret.Ease.cubicOut );
                    }
                    break;
                case 4:
                    // panel.alpha = 1;
                    if( isAlert ) {
                        view.x = popUpWidth;
                        egret.Tween.get( view ).to( { x: leftX }, 500, egret.Ease.cubicOut );
                    } else {
                        view.x = popUpWidth;
                        egret.Tween.get( view ).to( { x: 0 }, 500, egret.Ease.cubicOut );
                    }
                    break;
                case 5:
                    if( isAlert ) {
                        view.y = -popUpHeight;
                        egret.Tween.get( view ).to( { y: upY }, 500, egret.Ease.cubicOut );
                    } else {
                        view.y = -popUpHeight;
                        egret.Tween.get( view ).to( { y: 0 }, 500, egret.Ease.cubicOut );
                    }
                    break;
                case 6:
                    if( isAlert ) {
                        view.y = rootView.height;
                        egret.Tween.get( view ).to( { y: upY }, 500, egret.Ease.cubicOut );
                    } else {
                        view.y = popUpHeight;
                        egret.Tween.get( view ).to( { y: 0 }, 500, egret.Ease.cubicOut );
                    }
                    break;
                default:
                    break;
            }
        }
        
        /**
         *
         * @param effectType 0：没有动画 1:从中间缩小消失 2：  3：从左向右 4：从右向左 5、从上到下 6、从下到上
         */
        static closePanel ( rootView: egret.DisplayObjectContainer, view: egret.DisplayObject, options: IAmCloseOptions = {} ) {
            let effectType: BOUNCE_EX = options.effectType || BOUNCE_EX.NONE;
            if( Am.darkSprite ) {
                egret.Tween.get( Am.darkSprite ).to( { alpha: 0 }, 300 ).call( () => {
                    if( Am.darkSprite && Am.darkSprite.parent ) {
                        Am.darkSprite.parent.removeChild( Am.darkSprite );
                        Am.darkSprite = null;
                    }
                }, this );
            }
            let viewX      = view.x,
                viewY      = view.y,
                viewScaleX = view.scaleX,
                viewScaleY = view.scaleY;
            //以下是弹窗动画
            switch( effectType ) {
                case 0:
                    break;
                case 1:
                    egret.Tween.get( view ).to( {
                        alpha: 0,
                        scaleX: 0,
                        scaleY: 0,
                        x: view.x + view.width / 2,
                        y: view.y + view.height / 2
                    }, 300 );
                    break;
                case 2:
                    break;
                case 3:
                    egret.Tween.get( view ).to( { x: view.width }, 500, egret.Ease.cubicOut );
                    break;
                case 4:
                    egret.Tween.get( view ).to( { x: -view.width }, 500, egret.Ease.cubicOut );
                    break;
                case 5:
                    egret.Tween.get( view ).to( { y: view.height }, 500, egret.Ease.cubicOut );
                    break;
                case 6:
                    egret.Tween.get( view ).to( { y: -view.height }, 500, egret.Ease.cubicOut );
                    break;
                default:
                    break;
            }
            rootView.removeChild( view );
        }
    }
}
