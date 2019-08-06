class LoadingUI extends eui.UILayer {
    
    thumb: egret.Bitmap;
    thumb_mask: egret.Bitmap;
    
    constructor () {
        super();
        
        this._initPart();
    }
    
    private _initPart (): void {
        const bg    = new egret.Bitmap( RES.getRes( 'bg_png' ) );
        const logo  = new egret.Bitmap( RES.getRes( 'logo_png' ) );
        const trace = new egret.Bitmap( RES.getRes( 'progress_trace_png' ) );
        const thumb = new egret.Bitmap( RES.getRes( 'progress_thumb_png' ) );
        const mask  = new egret.Bitmap( RES.getRes( 'progress_thumb_png' ) );
        
        this.addChild( bg );
        this.addChild( logo );
        this.addChild( trace );
        this.addChild( thumb );
        this.addChild( mask );
        
        bg.height = 1136;
        
        logo.anchorOffsetY = 146;
        logo.anchorOffsetX = 252;
        logo.scaleX        = logo.scaleY = 0.5;
        logo.x             = 320;
        logo.y             = 450;
        
        trace.x = thumb.x = mask.x = 146;
        trace.y = thumb.y = mask.y = 538;
        
        thumb.mask = mask;
        mask.x     = thumb.x - mask.width;
        
        this.thumb      = thumb;
        this.thumb_mask = mask;
    }
    
    onProgress ( current: number, total: number ): void {
        let rate          = Math.round( current / total * 100 ) / 100;
        this.thumb_mask.x = ( rate - 1 ) * this.thumb_mask.width + this.thumb.x;
    }
}

