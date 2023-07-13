class Trazo {
  constructor(imagen, x, y, velocidadX, velocidadY) {
    this.imagen = imagen;
    this.x = x;
    this.y = y;
    this.velocidadX = velocidadX;
    this.velocidadY = velocidadY;
    this.ancho = 300, 500;
    this.alto = 300, 400;
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

  detener() {
    this.velocidadX = 0;
    this.velocidadY = 0;
  }

  cambiarUbicacion() {
    this.x = random(width - this.ancho);
    this.y = random(height - this.alto);
  }

  cambiarColor(color) {
    tint(color);
  }

  dibujar() {
    image(this.imagen, this.x, this.y, this.ancho, this.alto);
  }
}