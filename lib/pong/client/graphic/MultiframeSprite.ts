/**
 * MultiframeSprite contains all the images of
 * the frames of a sprite
 * It loads the spritesheet indicated by 'src'
 * Used in Renderer
 */
export class MultiframeSprite {
  imageBitmap!: ImageBitmap;
  imgReady: boolean = false;

  constructor(
    src: string,
    public frameWidth: number,
    public frameHeight: number,
    public nFrames: number,
    public reverse: boolean = false
  ) {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      createImageBitmap(image).then((imageBitmap: ImageBitmap) => {
        this.imageBitmap = imageBitmap;
        this.imgReady = true;
      });
    };
    image.onerror = function () {
      console.log(`Error loading ${src}`);
    };
  }

  draw(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    iFrame: number
  ) {
    if (!this.imgReady) return;
    iFrame = iFrame % this.nFrames;
    context.drawImage(
      this.imageBitmap,
      this.frameWidth * iFrame,
      0,
      this.frameWidth,
      this.frameHeight,
      x,
      y,
      w,
      h
    );
  }
}
