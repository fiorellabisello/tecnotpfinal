let monitorear = false;

let FREC_MIN = 900;
let FREC_MAX = 2000;

let AMP_MIN = 0.01;
let AMP_MAX = 0.4;

let mic;
let pitch;
let audioContext;

let gestorAmp;
let gestorPitch;

let haySonido; // estado de cómo está el sonido en cada momento
let antesHabiaSonido; // memoria del estado anterior del sonido

let estado = "movimiento"; // Estado inicial: moviendo trazos
let trazos = [];
let cantidad = 0;
let imagenes = [];

let ubicacion;
let color;
let colorInicial;
let colorFinal;

const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

function preload() {
  // Cargar las imágenes en el arreglo 'imagenes'
  imagenes.push(loadImage("https://res.cloudinary.com/dctwdrrg2/image/upload/v1686713196/trazo1_fgthgz.png"));
  imagenes.push(loadImage("https://res.cloudinary.com/dctwdrrg2/image/upload/v1686713193/trazo2_rngnwj.png"));
  imagenes.push(loadImage("https://res.cloudinary.com/dctwdrrg2/image/upload/v1686713197/trazo3_peahwl.png"));
  imagenes.push(loadImage("https://res.cloudinary.com/dctwdrrg2/image/upload/v1686713192/trazo4_xcc9sk.png"));
  imagenes.push(loadImage("https://res.cloudinary.com/dctwdrrg2/image/upload/v1686713193/trazo5_ysumim.png"));
  imagenes.push(loadImage("https://res.cloudinary.com/dctwdrrg2/image/upload/v1686713194/trazo6_nbuwl9.png"));
}

function setup() {
  createCanvas(500, 500);

  audioContext = getAudioContext(); // Inicia el motor de audio
  mic = new p5.AudioIn(); // Inicia el micrófono
  mic.start(startPitch); // Enciende el micrófono y le transmite el análisis de frecuencia (pitch) al micrófono. Conecta la librería con el micrófono

  userStartAudio();
  gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX);
  gestorPitch = new GestorSenial(FREC_MIN, FREC_MAX);

  antesHabiaSonido = false;

  for (let i = 0; i < 10; i++) {
    let imagen = random(imagenes);
    let x = random(width - imagen.width);
    let y = random(height - imagen.height);
    let velocidadX = random(-2, 2); // Velocidad aleatoria en el eje X
    let velocidadY = random(-2, 2); // Velocidad aleatoria en el eje Y
    let trazo = new Trazo(imagen, x, y, velocidadX, velocidadY);
    trazos.push(trazo);
  }
}

function draw() {
  background(255);

  let vol = mic.getLevel();
  gestorAmp.actualizar(vol);

  haySonido = gestorAmp.filtrada > 0.1;
  let inicioElSonido = haySonido && !antesHabiaSonido; // Evento de inicio de sonido
  let finDelSonido = !haySonido && antesHabiaSonido; // Evento de fin de sonido

  for (let i = 0; i < trazos.length; i++) {
    let trazo = trazos[i];

    if (estado === "movimiento") {
      trazo.mover();
    }

    trazo.dibujar();

    if (inicioElSonido) {
      if (estado === "movimiento") {
        trazo.detener();
      } else if (estado === "segundoEstado") {
        trazo.cambiarUbicacion();
      }
    }
  }

  if (inicioElSonido) {
    if (estado === "movimiento") {
      estado = "detenido";
    } else if (estado === "detenido") {
      estado = "segundoEstado";
      setTimeout(() => {
        estado = "tercerEstado";
      }, 5000);
    }
  } else if (finDelSonido) {
    if (estado === "detenido" || estado === "segundoEstado") {
      estado = "tercerEstado";
      setTimeout(() => {
        estado = "reinicio";
      }, 5000);
    }
  }

  antesHabiaSonido = haySonido;
}

// ---- Pitch detection ---
function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (frequency) {
      gestorPitch.actualizar(frequency);
      //console.log(frequency);
    }
    getPitch();
  });
}

class Trazo {
  constructor(imagen, x, y, velocidadX, velocidadY) {
    this.imagen = imagen;
    this.x = x;
    this.y = y;
    this.velocidadX = velocidadX;
    this.velocidadY = velocidadY;
    this.ancho = imagen.width;
    this.alto = imagen.height;
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

  dibujar() {
    fill(0);
    image(this.imagen, this.x, this.y, this.ancho, this.alto);
  }
}



