let turnos = [];

function cerrarSesion() {
  localStorage.removeItem('usuarioLogueado');
  window.location.href = 'index.html';
}




const usuarioLogueado = localStorage.getItem('usuarioLogueado');


if (!usuarioLogueado) {
  window.location.href = 'index.html';
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





function mostrarMensajeTurno(texto, tipo) {
  const msg = document.getElementById('mensaje-turno');
  msg.textContent = texto;
  msg.className = tipo;

  setTimeout(() => {
    msg.textContent = '';
    msg.className = '';
  }, 3000);
}






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
  renderizarTurnos();
  mostrarMensajeTurno('Turno cancelado.', 'error');
}









function cargarTurnosClientes() {
  const contenedor = document.getElementById('lista-clientes');
  const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');

  if (clientes.length === 0) {
    contenedor.innerHTML = '<p class="sin-turnos">No hay clientes registrados todavía.</p>';
    return;
  }

  contenedor.innerHTML = '';

  clientes.forEach(cliente => {
    const claveTurnos = 'turnos_' + cliente.nombre;
    const turnosCliente = JSON.parse(localStorage.getItem(claveTurnos) || '[]');

    const bloque = document.createElement('div');
    bloque.className = 'cliente-bloque';

    if (turnosCliente.length === 0) {
      bloque.innerHTML = `
        <h3>👤 ${cliente.nombre} (${cliente.email})</h3>
        <p class="sin-turnos">Sin turnos reservados.</p>
      `;
    } else {
      const items = turnosCliente.map(t => `
        <li>📅 ${t.fecha} a las ${t.hora} — 📞 ${t.telefono}</li>
      `).join('');

      bloque.innerHTML = `
        <h3>👤 ${cliente.nombre} (${cliente.email})</h3>
        <ul>${items}</ul>
      `;
    }

    contenedor.appendChild(bloque);
  });
}

cargarTurnosClientes();