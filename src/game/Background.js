export class Background {
    constructor(image, speed) {
      this.image = image;
      this.speed = speed;
      this.x = 0;
    }
  
    update(canvasWidth) {
      this.x -= this.speed;
      if (this.x <= -canvasWidth) {
        this.x = 0;
      }
    }
  
    draw(ctx, canvasWidth, canvasHeight) {
      ctx.drawImage(this.image, this.x, 0, canvasWidth, canvasHeight);
      ctx.drawImage(this.image, this.x + canvasWidth, 0, canvasWidth, canvasHeight);
    }
  }
  