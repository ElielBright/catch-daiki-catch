const loadImage = (src) => {
  const img = new Image();
  img.src = `/assets/${src}`;
  return img;
};

export const images = {
  cloud: loadImage("cloud.png"),
  kunai: loadImage("kunai.png"),
  fireball: loadImage("fireball.png"),
  ninja: loadImage("ninja.png"),
  ramen: loadImage("ramen.png"),  
  star: loadImage("star.png"),
  leonardo: loadImage("leonardo.png"),
  fishcake: loadImage("fishcake.png"), 
  sword: loadImage("sword.png"),       
};

