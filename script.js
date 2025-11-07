let tape = [];
let head = 0;
let state = "q0";
let steps = [];
let currentStep = 0;

const tapeDiv = document.getElementById("tape");
const stateSpan = document.getElementById("state");
const diPre = document.getElementById("instantaneousDesc");
const resultP = document.getElementById("result");

document.getElementById("runButton").addEventListener("click", iniciar);
document.getElementById("stepButton").addEventListener("click", siguientePaso);
document.getElementById("resetButton").addEventListener("click", reiniciar);

function iniciar() {
  const input = document.getElementById("input").value.trim();
  if (!input.includes(" ")) {
    alert("Por favor, ingresa dos números binarios separados por un espacio.");
    return;
  }
  const [a, b] = input.split(" ");
  if (!/^[01]+$/.test(a) || !/^[01]+$/.test(b)) {
    alert("Solo se permiten números binarios (0 y 1).");
    return;
  }

  reiniciar(false);
  tape = ["_", ...a.split(""), "_", ...b.split(""), "_"];
  head = 1;
  state = "q0";
  renderTape();

  const suma = simularSuma(a, b);
  steps = suma.pasos;
  diPre.textContent = "Máquina iniciada...\nPresiona 'Paso a paso' para comenzar.";
  document.getElementById("stepButton").disabled = false;
}

function siguientePaso() {
  if (currentStep < steps.length) {
    const paso = steps[currentStep];
    state = paso.estado;
    head = paso.cabezal;
    renderTape();
    mostrarDI(paso);
    actualizarGrafo(state);
    actualizarTabla(paso.transicion);
    currentStep++;
  } else {
    document.getElementById("stepButton").disabled = true;
    actualizarGrafo("q_accept");
    resultP.textContent = steps.at(-1).resultadoFinal;
    diPre.textContent += "\n✅ La máquina ha finalizado.";
  }
}

function reiniciar(resetInput = true) {
  tape = [];
  head = 0;
  state = "q0";
  steps = [];
  currentStep = 0;
  renderTape();
  actualizarGrafo("reset");
  diPre.textContent = "Esperando entrada...";
  resultP.textContent = "-";
  document.getElementById("stepButton").disabled = true;
  if (resetInput) document.getElementById("input").value = "";
}

function renderTape() {
  tapeDiv.innerHTML = "";
  tape.forEach((symbol, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.textContent = symbol === "_" ? "□" : symbol;
    if (i === head) cell.classList.add("active");
    tapeDiv.appendChild(cell);
  });
  stateSpan.textContent = state;
}

function mostrarDI(paso) {
  const di = `(${paso.estado}, ${paso.cinta.join("")}, ${paso.cabezal})`;
  diPre.textContent += `\n${di}`;
  diPre.scrollTop = diPre.scrollHeight;
}

//  ANIMACIÓN 
function actualizarGrafo(estado) {
  ["q0", "q1", "q_accept"].forEach(id => {
    const node = document.getElementById(`node-${id}`);
    if (!node) return;
    node.classList.remove("active-node");
  });
  const activo = document.getElementById(`node-${estado}`);
  if (activo) activo.classList.add("active-node");
}

// TABLA DE TRANSICIÓN
function actualizarTabla(transicion) {
  const tabla = document.querySelector(".tabla-transicion");
  if (!tabla) return;

  
  tabla.querySelectorAll("tr").forEach(tr => {
    tr.style.background = "white";
    tr.style.transition = "background 0.3s";
  });

  // Determinar cuál fila resaltar según el estado actual
  let filaIndex = -1;
  if (state === "q0") filaIndex = 1;
  else if (state === "q1") filaIndex = 2;
  else if (state === "q_accept") filaIndex = 4;

 
  if (filaIndex > 0) {
    const fila = tabla.querySelectorAll("tr")[filaIndex];
    if (fila) fila.style.background = "#dbeafe";
  }
}


//paso a paso de la suma binaria 
function simularSuma(a, b) {
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let resultado = "";
  let pasos = [];
  let cabezal = 1;
  let cinta = ["_", ...a.split(""), "_", ...b.split(""), "_"];

  while (i >= 0 || j >= 0 || carry) {
    const bitA = i >= 0 ? parseInt(a[i--]) : 0;
    const bitB = j >= 0 ? parseInt(b[j--]) : 0;
    const suma = bitA + bitB + carry;
    const bitResultado = suma % 2;
    carry = Math.floor(suma / 2);
    resultado = bitResultado + resultado;

    pasos.push({
      estado: carry ? "q1" : "q0",
      cinta: [...cinta],
      cabezal: cabezal++,
      resultadoFinal: "",
      transicion: { estado: carry ? "q1" : "q0", simbolo: bitA }
    });
  }

  pasos.push({
    estado: "q_accept",
    cinta: [...cinta],
    cabezal,
    resultadoFinal: resultado,
    transicion: { estado: "q_accept" }
  });

  return { pasos, resultado };
}
