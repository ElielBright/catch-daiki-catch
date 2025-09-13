import { images } from "./assets";

export class Player {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
  }

  move(keys, canvasWidth) {
    if (keys["ArrowLeft"] && this.x > 0) this.x -= this.speed;
    if (keys["ArrowRight"] && this.x < canvasWidth - this.size)
      this.x += this.speed;
  }

  draw(ctx) {
    if (images.ninja.complete) {
      ctx.drawImage(images.ninja, this.x, this.y, this.size, this.size);
    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }
}
