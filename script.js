let tape = [];
let head = 0;
let state = "q0";
let steps = [];
let currentStep = 0;

let autoInterval = null;
let autoRunning = false;


const tapeDiv = document.getElementById("tape");
const stateSpan = document.getElementById("state");
const diPre = document.getElementById("instantaneousDesc");
const resultP = document.getElementById("result");
const mathPre = document.getElementById("mathDesc");


document.getElementById("runButton").addEventListener("click", iniciar);
document.getElementById("stepButton").addEventListener("click", siguientePaso);
document.getElementById("resetButton").addEventListener("click", reiniciar);
document.getElementById("autoButton").addEventListener("click", toggleAutoSim);


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

  diPre.textContent = "Máquina iniciada...\nPresiona 'Paso a paso' o 'Simular automáticamente' para comenzar.";
  document.getElementById("stepButton").disabled = false;
  document.getElementById("autoButton").disabled = false;
}


function siguientePaso() {
  if (currentStep < steps.length) {
    const paso = steps[currentStep];
    state = paso.estado;
    head = paso.cabezal;
    renderTape();

    // Limpiar marcas visuales del arreglo tape
    tape = tape.map(sym => sym.replace(/[()]/g, ""));

    mostrarDI(paso);
    actualizarGrafo(state);
    actualizarTabla(paso.transicion);

    currentStep++;
  } else {
  document.getElementById("stepButton").disabled = true;
  actualizarGrafo("q2");
  const resultadoFinal = steps.at(-1).resultadoFinal;
  resultP.textContent = resultadoFinal;
  diPre.textContent += "\n✅ La máquina ha finalizado.";

  
  resultP.classList.add("result-highlight");

  
  setTimeout(() => {
    resultP.classList.remove("result-highlight");
  }, 3000);
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
  document.getElementById("autoButton").disabled = true;
  if (resetInput) document.getElementById("input").value = "";
}


function renderTape() {
  tapeDiv.innerHTML = "";

  tape.forEach((symbol, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    // Si el símbolo está marcado con paréntesis (ej. "(1)")
    if (/^\(.*\)$/.test(symbol)) {
      const cleanSymbol = symbol.replace(/[()]/g, "");
      cell.textContent = cleanSymbol;
      cell.classList.add("cell-marked");
    } else {
      cell.textContent = symbol === "_" ? "□" : symbol;
    }

   
    if (i === head) {
      cell.classList.add("active");
    }

    tapeDiv.appendChild(cell);
  });

  stateSpan.textContent = state;
}


function mostrarDI(paso) {
  const di = `(${paso.estado}, ${paso.cinta.join("")}, ${paso.cabezal})`;
  diPre.textContent += `\n${di}`;
  diPre.scrollTop = diPre.scrollHeight;

 if (paso.operacion) {
    mathPre.textContent += `\n${paso.operacion}`;
    mathPre.scrollTop = mathPre.scrollHeight;
  }



}


function actualizarGrafo(estado) {
  const nodos = ["q0", "q1", "q2"];
  nodos.forEach(id => {
    const node = document.getElementById(`node-${id}`);
    if (!node) return;
    node.classList.remove("active-node", "accept-highlight");
  });

  const activo = document.getElementById(`node-${estado}`);
  if (!activo) return;

  
  activo.classList.add("active-node");

  
  if (estado === "q_accept" || estado === "q2") {
    activo.classList.remove("active-node");
    activo.classList.add("accept-highlight");

    
    setTimeout(() => {
      activo.classList.remove("accept-highlight");
      activo.classList.add("active-node");
    }, 3000);
  }
}



function actualizarTabla(transicion) {
  const tabla = document.querySelector(".tabla-transicion");
  if (!tabla) return;

  
  tabla.querySelectorAll("tr").forEach(tr => {
    tr.style.background = "white";
    tr.style.transition = "background 0.3s";
  });

  
  let filaIndex = -1;
  if (state === "q0") filaIndex = 1;
  else if (state === "q1") filaIndex = 2;
  else if (state === "q_accept") filaIndex = 4;

 
  if (filaIndex > 0) {
    const fila = tabla.querySelectorAll("tr")[filaIndex];
    if (fila) fila.style.background = "#dbeafe";
  }
}


function simularSuma(a, b) {
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let resultado = "";
  let pasos = [];


  let cinta = ["_", ...a.split(""), "_", ...b.split(""), "_"];
  let cabezal = cinta.length - 2;  

  while (i >= 0 || j >= 0 || carry) {
    const bitA = i >= 0 ? parseInt(a[i--]) : 0;
    const bitB = j >= 0 ? parseInt(b[j--]) : 0;
    const suma = bitA + bitB + carry;
    const bitResultado = suma % 2;
    carry = Math.floor(suma / 2);
    resultado = bitResultado + resultado;
    const textoOperacion = `${bitA} + ${bitB} + ${carry ? "1(carry)" : "0"} = ${bitResultado} ${carry ? "(carry 1)" : ""}`;


    
    const cintaPaso = [...cinta];
    if (cabezal >= 0 && cabezal < cintaPaso.length) {
      cintaPaso[cabezal] = `(${cintaPaso[cabezal]})`;
    }

    pasos.push({
      estado: carry ? "q1" : "q0",
      cinta: [...cintaPaso],
      cabezal,
      resultadoFinal: "",
       operacion: textoOperacion,
      transicion: { estado: carry ? "q1" : "q0", simbolo: bitA }
    });

    cabezal--; 
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


function toggleAutoSim() {
  const btn = document.getElementById("autoButton");

  if (!autoRunning) {
    
    autoRunning = true;
    btn.textContent = "⏸ Pausar simulación";

    autoInterval = setInterval(() => {
      if (currentStep < steps.length) {
        siguientePaso();
      } else {
        clearInterval(autoInterval);
        autoRunning = false;
        btn.textContent = "Simular automáticamente";
      }
    }, 500); 
  } else {
    
    clearInterval(autoInterval);
    autoRunning = false;
    btn.textContent = "▶ Reanudar simulación";
  }
}
