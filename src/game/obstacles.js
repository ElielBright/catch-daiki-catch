export class Obstacle {
  constructor(x, y, size, speed, image, type = "straight") {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.image = image;
    this.type = type;
    this.direction = Math.random() < 0.5 ? 1 : -1; // for zig-zag
  }

  update() {
    this.y += this.speed;
    if (this.type === "zigzag") {
      this.x += this.speed * 0.7 * this.direction;
      if (this.x <= 0 || this.x + this.size >= 600) this.direction *= -1;
    }
  }

  draw(ctx) {
    if (this.image instanceof HTMLImageElement && this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  collides(player) {
    const padding = 6; // smaller hitbox
    return !(
      player.x + padding > this.x + this.size - padding ||
      player.x + player.size - padding < this.x + padding ||
      player.y + padding > this.y + this.size - padding ||
      player.y + player.size - padding < this.y + padding
    );
  }
}
