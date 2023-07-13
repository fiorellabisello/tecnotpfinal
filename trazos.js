class Trazo {
  constructor(imagen, x, y, velocidadX, velocidadY) {
    this.imagen = imagen;
    this.x = x;
    this.y = y;
    this.velocidadX = velocidadX;
    this.velocidadY = velocidadY;
    this.ancho = random(250, 300); // Generar ancho aleatorio entre 100 y 300
    this.alto = random(300, 400); // Generar alto aleatorio entre 100 y 300
  }

  mover() {
    this.x += this.velocidadX;
    this.y += this.velocidadY;

    // Rebotar el trazo si alcanza los límites del lienzo
    if (this.x <= 0 || this.x >= width - this.ancho) {
      this.velocidadX *= -1;
    }
    if (this.y <= 0 || this.y >= height - this.alto) {
      this.velocidadY *= -1;
    }
  }

  dibujar() {
    image(this.imagen, this.x, this.y, this.ancho, this.alto);
  }
}
