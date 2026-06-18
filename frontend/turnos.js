const API_URL = 'http://localhost:3000';

let turnos = [];
let idEnEdicion = null;

const usuarioId = localStorage.getItem('usuarioId');
const usuarioNombre = localStorage.getItem('usuarioNombre');
const rol = localStorage.getItem('rol');

if (!usuarioId || rol !== 'admin') {
  window.location.href = 'index.html';
}

function cerrarSesion() {
  localStorage.removeItem('usuarioId');
  localStorage.removeItem('usuarioNombre');
  localStorage.removeItem('rol');
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



async function agregarTurno() {
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

  if (idEnEdicion) {
    await guardarEdicion(fecha, hora, telefono);
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/turnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: usuarioNombre,
        telefono,
        fecha,
        hora,
        usuarioId: Number(usuarioId)
      })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensajeTurno(datos.error, 'error');
      return;
    }

    limpiarFormulario();
    mostrarMensajeTurno('¡Turno reservado con éxito!', 'exito');
    cargarTurnos();

  } catch (error) {
    mostrarMensajeTurno('Error al conectar con el servidor.', 'error');
  }
}




async function guardarEdicion(fecha, hora, telefono) {
  try {
    const respuesta = await fetch(`${API_URL}/turnos/${idEnEdicion}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, hora, telefono })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensajeTurno(datos.error, 'error');
      return;
    }

    cancelarEdicion();
    mostrarMensajeTurno('Turno actualizado correctamente.', 'exito');
    cargarTurnos();

  } catch (error) {
    mostrarMensajeTurno('Error al conectar con el servidor.', 'error');
  }
}





function limpiarFormulario() {
  document.getElementById('turno-fecha').value = '';
  document.getElementById('turno-hora').value = '';
  document.getElementById('turno-telefono').value = '';
}

async function cargarTurnos() {
  try {
    const respuesta = await fetch(`${API_URL}/turnos`);
    const todosLosTurnos = await respuesta.json();

    turnos = todosLosTurnos.filter(t => t.usuarioId === Number(usuarioId));

    turnos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const lista = document.getElementById('lista-turnos');
    lista.innerHTML = '';

    if (turnos.length === 0) {
      lista.innerHTML = '<li class="sin-turnos">No tenés turnos reservados todavía.</li>';
      return;
    }

    turnos.forEach(turno => {
      const fechaFormateada = turno.fecha.split('T')[0];
      const li = document.createElement('li');
      li.className = 'turno-item';
      li.innerHTML = `
    <div>
      <strong>📅 ${fechaFormateada}</strong> a las <strong>${turno.hora}</strong>
      <br>
      📞 ${turno.telefono}
    </div>
    <div class="botones-turno">
    <button onclick="iniciarEdicion(${turno.id}, '${fechaFormateada}', '${turno.hora}', '${turno.telefono}')">Editar</button>      <button onclick="eliminarTurno(${turno.id})">Cancelar</button>
    </div>
  `;
      lista.appendChild(li);
    });

  } catch (error) {
    mostrarMensajeTurno('Error al cargar los turnos.', 'error');
  }
}

cargarTurnos();



function iniciarEdicion(id, fecha, hora, telefono) {
  idEnEdicion = id;

  document.getElementById('turno-fecha').value = fecha;
  document.getElementById('turno-hora').value = hora;
  document.getElementById('turno-telefono').value = telefono;

  document.getElementById('titulo-formulario').textContent = 'Editando turno';
  document.getElementById('boton-formulario').textContent = 'Guardar cambios';
  document.getElementById('boton-cancelar-edicion').style.display = 'block';

  document.querySelector('.form-turno').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicion() {
  idEnEdicion = null;
  limpiarFormulario();
  document.getElementById('titulo-formulario').textContent = 'Sacar un turno';
  document.getElementById('boton-formulario').textContent = 'Confirmar turno';
  document.getElementById('boton-cancelar-edicion').style.display = 'none';
}







async function eliminarTurno(id) {
  const confirmar = confirm('¿Seguro que querés cancelar este turno?');

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/turnos/${id}`, {
      method: 'DELETE'
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensajeTurno(datos.error, 'error');
      return;
    }

    mostrarMensajeTurno('Turno cancelado.', 'error');
    cargarTurnos();

  } catch (error) {
    mostrarMensajeTurno('Error al conectar con el servidor.', 'error');
  }
}

async function cargarTurnosClientes() {
  const contenedor = document.getElementById('lista-clientes');

  try {
    const respuesta = await fetch(`${API_URL}/usuarios`);
    const clientes = await respuesta.json();

    if (clientes.length === 0) {
      contenedor.innerHTML = '<p class="sin-turnos">No hay clientes registrados todavía.</p>';
      return;
    }

    contenedor.innerHTML = '';

    clientes.forEach(cliente => {
      const bloque = document.createElement('div');
      bloque.className = 'cliente-bloque';

      if (cliente.turnos.length === 0) {
        bloque.innerHTML = `
          <h3>👤 ${cliente.nombre} (${cliente.email})</h3>
          <p class="sin-turnos">Sin turnos reservados.</p>
        `;
      } else {
        const items = cliente.turnos.map(t => {
          const fechaFormateada = t.fecha.split('T')[0];
          return `<li>📅 ${fechaFormateada} a las ${t.hora} — 📞 ${t.telefono}</li>`;
        }).join('');

        bloque.innerHTML = `
          <h3>👤 ${cliente.nombre} (${cliente.email})</h3>
          <ul>${items}</ul>
        `;
      }

      contenedor.appendChild(bloque);
    });

  } catch (error) {
    contenedor.innerHTML = '<p class="sin-turnos">Error al cargar los clientes.</p>';
  }
}

cargarTurnosClientes();