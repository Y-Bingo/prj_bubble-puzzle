namespace ui
{
    export class ImageButton extends eui.Image
    {
        constructor ()
        {
            super();

            this.addEventListener( egret.Event.ADDED_TO_STAGE, this._onAddToStage, this );
        }

        childrenCreated (): void
        {
            super.childrenCreated();

            // this.anchorOffsetX = this.width / 2;
            // this.anchorOffsetY = this.height / 2;
        }

        private _onAddToStage ( e: egret.Event ): void
        {
            let self = this;

            self.addEventListener( egret.TouchEvent.TOUCH_BEGIN, self._onTouchBegin, self );
            self.addEventListener( egret.TouchEvent.TOUCH_END, self._onTouchEnd, self );
            self.addEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, self._onTouchEnd, self );
            self.addEventListener( egret.TouchEvent.TOUCH_CANCEL, self._onTouchEnd, self );
            self.addEventListener( egret.Event.REMOVED_FROM_STAGE, self._onRemoveFromStage, self );
        }

        private _onRemoveFromStage (): void
        {
            let self = this;

            self.removeEventListener( egret.TouchEvent.TOUCH_BEGIN, self._onTouchBegin, self );
            self.removeEventListener( egret.TouchEvent.TOUCH_END, self._onTouchEnd, self );
            self.removeEventListener( egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, self._onTouchEnd, self );
            self.removeEventListener( egret.TouchEvent.TOUCH_CANCEL, self._onTouchEnd, self );
            self.removeEventListener( egret.Event.REMOVED_FROM_STAGE, self._onRemoveFromStage, self );
        }

        private _onTouchBegin ( e: egret.TouchEvent )
        {
            this.scaleX = 1.1;
            this.scaleY = 1.1;
        }

        private _onTouchEnd ( e: egret.TouchEvent )
        {
            this.scaleX = 1;
            this.scaleY = 1;
        }
    }
}
