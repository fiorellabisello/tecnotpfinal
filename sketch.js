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

let estado = "primerEstado"; // Estado inicial: moviendo trazos
let trazos = [];
let cantidad = 0;
let imagenes = [];
const posicion = ["vertical", "horizontal"];
let orientacion;
let goldenLines = 0;


let ubicacion;
let color;
let colorInicial;
let colorFinal;

let tiempoActualTercerEstado;
let tiempoActualSegundoEstado;
let tiempoActualCuartoEstado;
let tiempoLimite = 5000;
let contadorSegundoEstado = false;
let contadorTercerEstado = false;
let contadorCuartoEstado = false;


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
  orientacion = random(posicion)
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
  const colores = ["#CDD31A", "#B67964", "#EAC9AF", "#57B89D", "#C7937B", "#8672B0", "#EF5047", "#F3A09C", "#A7654C", "#784B44"];
  haySonido = gestorAmp.filtrada > 0.1;

  let inicioElSonido = haySonido && !antesHabiaSonido; // Evento de inicio de sonido
  let finDelSonido = !haySonido && antesHabiaSonido; // Evento de fin de sonido


    for (let i = 0; i < trazos.length; i++) {
      let trazo = trazos[i];
  
      if (estado === "primerEstado") {
        if(!haySonido){
          trazo.mover();
        }
        if(inicioElSonido){ 
          trazo.detener()
          estado = "segundoEstado"
        }
      }
  
      if(estado === "segundoEstado"){
        if(contadorSegundoEstado === false){
          tiempoActualSegundoEstado = millis();
          contadorSegundoEstado = true;
        }
        if(inicioElSonido){
          trazo.cambiarUbicacion();
        }
        if(finDelSonido){ //se actualiza el tiempoActual cada vez que se oye un sonido nuevo
          tiempoActualSegundoEstado = millis();
        }
        if(!haySonido){
          let actual = millis();
          if(actual > (tiempoActualSegundoEstado + tiempoLimite)){
            estado = "tercerEstado";
          }
        }
      }

      if(estado === "tercerEstado"){
        if(contadorTercerEstado === false){
          tiempoActualTercerEstado = millis();
          contadorTercerEstado = true;
        }

        if(inicioElSonido){
          let indiceAleatorio = Math.floor(Math.random() * colores.length);
          trazo.cambiarColor(colores[indiceAleatorio]);
          colores.splice(indiceAleatorio, 1);
        }

        if(finDelSonido){ //se actualiza el tiempoActual cada vez que se oye un sonido nuevo
          tiempoActualTercerEstado = millis();
        }
        if(!haySonido){
          let actual = millis();
          if(actual > (tiempoActualTercerEstado + tiempoLimite)){
            estado = "cuartoEstado";
          }
        }
      }
  
      if (estado === "cuartoEstado") {
        if(contadorCuartoEstado == false){
          tiempoActualCuartoEstado = millis()
          contadorCuartoEstado = true;
        }
        strokeWeight(10);
        let goldenLines = 0;
      
        if (orientacion === "horizontal") {
          for (let y = 30; y < height; y += 30) {
            if ((goldenLines < gestorPitch.filtrada * 30) && gestorAmp.filtrada > 0.001) {
              stroke(218, 165, 7);
              goldenLines++;
            } else {
              stroke(255);
            }
            line(y, height, y, 0);
          }
        } else {
          for (let x = 30; x < width; x += 30) {
            if ((goldenLines < gestorPitch.filtrada * 30) && gestorAmp.filtrada > 0.001) {
              stroke(218, 165, 7);
              goldenLines++;
            } else {
              stroke(255);
            }
            line(0, x, width, x);
          }
        }
        if(haySonido || !haySonido){
          let actual = millis();
          if(actual > (tiempoActualCuartoEstado + tiempoLimite)){
            estado = "final";
          }
        }
      } 
      trazo.dibujar(); 
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
