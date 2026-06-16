let turnos = [];

const usuarioLogueado = localStorage.getItem('usuarioLogueado');
const rol = localStorage.getItem('rol');

if (!usuarioLogueado || rol !== 'cliente') {
  window.location.href = 'index.html';
}

document.getElementById('nombre-usuario').textContent = usuarioLogueado;

// Clave única por cliente para guardar sus turnos
const claveTurnos = 'turnos_' + usuarioLogueado;

// Carga los turnos guardados de este cliente
const turnosGuardados = localStorage.getItem(claveTurnos);
if (turnosGuardados) {
  turnos = JSON.parse(turnosGuardados);
  renderizarTurnos();
}






function cerrarSesion() {
  localStorage.removeItem('usuarioLogueado');
  localStorage.removeItem('rol');
  window.location.href = 'index.html';
}

function mostrarMensajeTurno(texto, tipo) {
  const msg = document.getElementById('mensaje-turno');
  msg.textContent = texto;
  msg.className = tipo;
  setTimeout(() => {
    msg.textContent = '';
    msg.className = '';
  }, 3000);
}

function establecerFechaMinima() {
  const inputFecha = document.getElementById('turno-fecha');
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  inputFecha.min = `${año}-${mes}-${dia}`;
}

establecerFechaMinima();








function agregarTurno() {
  const fecha = document.getElementById('turno-fecha').value;
  const hora = document.getElementById('turno-hora').value;
  const telefono = document.getElementById('turno-telefono').value.trim();

  if (fecha === '' || hora === '' || telefono === '') {
    mostrarMensajeTurno('Completá todos los campos.', 'error');
    return;
  }

  if (telefono.length < 8 || isNaN(telefono)) {
    mostrarMensajeTurno('El teléfono debe tener al menos 8 números.', 'error');
    return;
  }

  const turnoRepetido = turnos.find(t => t.fecha === fecha && t.hora === hora);

    if (turnoRepetido) {
    mostrarMensajeTurno('Ya tenés un turno en esa fecha y horario.', 'error');
    return;
    }

  const nuevoTurno = {
    id: Date.now(),
    fecha,
    hora,
    telefono
  };

  turnos.push(nuevoTurno);
  localStorage.setItem(claveTurnos, JSON.stringify(turnos));
  renderizarTurnos();
  limpiarFormulario();
  mostrarMensajeTurno('¡Turno reservado con éxito!', 'exito');
}




function renderizarTurnos() {
  turnos.sort((a, b) => {
    const fechaA = new Date(a.fecha + 'T' + a.hora);
    const fechaB = new Date(b.fecha + 'T' + b.hora);
    return fechaA - fechaB;
  });

  const lista = document.getElementById('lista-turnos');
  lista.innerHTML = '';

  if (turnos.length === 0) {
    lista.innerHTML = '<li class="sin-turnos">No tenés turnos reservados todavía.</li>';
    return;
  }

  turnos.forEach(turno => {
    const li = document.createElement('li');
    li.className = 'turno-item';
    li.innerHTML = `
      <div>
        <strong>📅 ${turno.fecha}</strong> a las <strong>${turno.hora}</strong>
        <br>
        📞 ${turno.telefono}
      </div>
      <button onclick="eliminarTurno(${turno.id})">Cancelar</button>
    `;
    lista.appendChild(li);
  });
}






function eliminarTurno(id) {
  const confirmar = confirm('¿Seguro que querés cancelar este turno?');
  
  if (!confirmar) return;

  turnos = turnos.filter(turno => turno.id !== id);
  localStorage.setItem(claveTurnos, JSON.stringify(turnos));
  renderizarTurnos();
  mostrarMensajeTurno('Turno cancelado.', 'error');
}

function limpiarFormulario() {
  document.getElementById('turno-fecha').value = '';
  document.getElementById('turno-hora').value = '';
  document.getElementById('turno-telefono').value = '';
}