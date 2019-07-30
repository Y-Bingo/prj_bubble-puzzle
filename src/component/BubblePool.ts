namespace ui {

    const MIN = 5;
    const MAX = 170;
    // const MIN = 5;
    // 泡泡对象池
    class BubblePool {
        
        protected static _instance: BubblePool;
        public static getIns (): BubblePool {
            let Class = this;
            if( !Class._instance )
                Class._instance = new BubblePool();
            return Class._instance;
        }
        
        private _pool: Bubble[];
        
        constructor () {
            this._pool = [];
            // 初始化泡泡
        }
        
        getSize (): number {
            return this._pool.length;
        }
        
        // 创建一个泡泡
        createBubble ( value: df.BubbleType ): Bubble {
            if( value == core.NodeType.NONE ) return null;
            
            let bubble = this._pop();
            bubble.setValue( value );
            
            // 判断是否为工具型泡泡
            if( !!( value as number & 0xf0 ) ) {
                bubble._rotation = df.ROTATION;
            }
            
            return bubble;
        }
        // 弹出一个泡泡
        private _pop (): Bubble {
            if( this._pool.length <= 0 ) {
                this._extendPool();
            }
            return this._pool.pop();
        }
        // 扩容
        private _extendPool (): void {
            for( let i = 0; i < MIN; i++ ) {
                this._pool.push( new Bubble() );
            }
        }
        
        // 回收一个泡泡
        recycleBubble ( bubble: Bubble ): void {
            if( bubble.parent ) {
                bubble.parent.removeChild( bubble );
            }
            bubble.reset();
            
            this._push( bubble );
        }
        private _push ( bubble: Bubble ): void {
            if( this._pool.length > MAX ) {
                this._reducePool();
            }
            
            this._pool.push( bubble );
        }
        // 缩容
        private _reducePool (): void {
            this._pool.length = ( this._pool.length / 2 ) >> 0;
        }
    }
    
    export const bubblePool = new BubblePool();
}