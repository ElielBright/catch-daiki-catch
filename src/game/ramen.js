export class Ramen {
  constructor(x, y, size, speed, image = null, isFishcake = false) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.image = image;
    this.isFishcake = isFishcake;
    this.collected = false; // prevent multiple collision triggers
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    if (this.image && this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    } else {
      ctx.fillStyle = this.isFishcake ? "pink" : "orange"; // easier to spot fishcake
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  collides(player) {
    if (this.collected) return false; // already collected
    const padding = 6;
    return !(
      this.x + padding > player.x + player.size - padding ||
      this.x + this.size - padding < player.x + padding ||
      this.y + padding > player.y + player.size - padding ||
      this.y + this.size - padding < player.y + padding
    );
  }
}
