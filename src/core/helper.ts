namespace utils {
    /* -------------------- 数组辅助工具 --------------------*/
    /**
     * 拷贝数据
     * @param src 被拷贝数据
     * @param dst 待拷贝数据 目标盘拷贝数据
     */
    export function Copy<T> ( srcArr: T[], dstArr: T[] ): T[] {
        let len = srcArr.length;
        for( let i = 0; i < len; i++ ) {
            dstArr[ i ] = JSON.parse( JSON.stringify( srcArr[ i ] ) ) as T;
        }
        for( let j = len; j < dstArr.length; j++ ) {
            dstArr.pop();
        }
        
        return dstArr;
    }
    
    /**
     * 交换数组数据的两个位置的数据
     * @param srcArr 源数组
     * @param l     待交换位置1
     * @param r     待交换位置2
     */
    export function Swap<T> ( srcArr: T[], l: number, r: number ) {
        if( l === r || l < 0 || l >= srcArr.length || r < 0 || r > srcArr.length ) return;
        let temp    = srcArr[ l ];
        srcArr[ l ] = srcArr[ r ];
        srcArr[ r ] = temp;
    }
    
    /**
     * 填充数组
     * @param srcArr 源数组
     * @param value  填充值
     * @param start  填充起始索引
     * @param end    填充结束索引
     */
    export function Fill<T> ( srcArr: T[], value: T | any, start: number = 0, end: number = srcArr.length ): T[] {
        for( let i = start; i < end; i++ ) {
            srcArr[ i ] = JSON.parse( JSON.stringify( value ) ) as T;
        }
        return srcArr;
    }
    
    /**
     * @param srcArr 源数组
     * @param rmvArr 待移除数据
     */
    export function Remove<T> ( srcArr: T[], rmvArr: T[] ): boolean {
        let srcLen = srcArr.length;
        let rmvLen = rmvArr.length;
        if( srcLen <= 0 || rmvLen <= 0 ) {
            console.warn( 'remove Error. rmvLen <= 0 || srcLen <= 0' );
            return false;
        }
        
        let point = 0;
        let i     = 0, j = 0;
        for( i = 0; i < srcLen; i++ ) {
            for( j = 0; j < rmvLen; j++ ) {
                if( rmvArr[ j ] === srcArr[ i ] ) break;
            }
            
            if( j == rmvLen )
                srcArr[ point++ ] = srcArr[ i ];
        }
        
        srcArr.length = point;
        
        return true;
    }
    
    /* -------------------- 对象辅助工具 --------------------*/
    export function isObject ( val: any ): val is Object {
        return val != null && typeof val === 'object';
    }
}
