function ver(id) {
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

function fila(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    const divFila = document.createElement('div');
    divFila.className = 'fila';
    divFila.innerHTML = `
        <input type="text" placeholder="Clave" class="clave-input">
        <input type="text" placeholder="Valor" class="valor-input">
        <button type="button" onclick="this.parentElement.remove()" style="color:red">X</button>
    `;
    contenedor.appendChild(divFila);
}

async function actualizarHistorial() {
    try {
        const res = await fetch('/ver-historial');
        const lista = await res.json();
        const contenedor = document.getElementById('lista-historial');
        if (contenedor) {
            contenedor.innerHTML = lista.map(url => `<li>${url}</li>`).join('');
        }
    } catch (e) { console.log("Error cargando historial"); }
}

document.getElementById('enviar').onclick = async () => {
    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;

    // VALIDACIÓN CON SWEETALERT2
    if (!usuario || !clave) {
        Swal.fire({
            title: 'Acceso Denegado',
            text: 'Por favor, introduce Usuario y Contraseña en la pestaña Auth.',
            icon: 'warning',
            confirmButtonColor: '#2eb67d',
            background: '#1e1e1e',
            color: '#fff'
        });
        ver('auth');
        return;
    }

    let urlBase = document.getElementById('url').value;
    const miApiKey = document.getElementById('token').value;

    if (miApiKey && !urlBase.includes('api_key')) {
        urlBase += (urlBase.includes('?') ? '&' : '?') + "api_key=" + miApiKey;
    }

    const metodo = document.getElementById('metodo').value;
    const estadoNodo = document.getElementById('estado');
    const salidaNodo = document.getElementById('salida');

    salidaNodo.value = "Cargando...";
    estadoNodo.innerText = "-";

    fetch(`/guardar-historial?url=${encodeURIComponent(document.getElementById('url').value)}`, { method: 'POST' })
        .then(() => actualizarHistorial());

    let urlFinal = urlBase;
    const paramsFilas = document.querySelectorAll('#lista-params .fila');
    if (paramsFilas.length > 0) {
        const queryParams = new URLSearchParams();
        paramsFilas.forEach(f => {
            const k = f.querySelector('.clave-input').value;
            const v = f.querySelector('.valor-input').value;
            if (k) queryParams.append(k, v);
        });
        if (queryParams.toString()) {
            urlFinal += (urlFinal.includes('?') ? '&' : '?') + queryParams.toString();
        }
    }

    let opcionesFetch = { method: metodo };

    if (['POST', 'PUT', 'PATCH'].includes(metodo)) {
        const cuerpoJson = document.getElementById('entrada').value;

        if (cuerpoJson.trim() !== "") {
            opcionesFetch.body = cuerpoJson;
            opcionesFetch.headers = { 'Content-Type': 'application/json' };
        } else {
            const formFilas = document.querySelectorAll('#lista-form .fila');
            if (formFilas.length > 0) {
                const formData = new FormData();
                formFilas.forEach(f => {
                    const k = f.querySelector('.clave-input').value;
                    const v = f.querySelector('.valor-input').value;
                    if (k) formData.append(k, v);
                });
                opcionesFetch.body = formData;
            }
        }
    }

    try {
        const respuesta = await fetch(urlFinal, opcionesFetch);
        const datos = await respuesta.json();

        estadoNodo.innerText = respuesta.status + " " + respuesta.statusText;
        estadoNodo.style.color = respuesta.ok ? "#2eb67d" : "#ef9a9a";
        salidaNodo.value = JSON.stringify(datos, null, 2);

    } catch (error) {
        estadoNodo.innerText = "Error";
        estadoNodo.style.color = "red";
        salidaNodo.value = "Error en la petición o JSON inválido: " + error.message;
    }
};

window.onload = async () => {
    fila('lista-params');
    fila('lista-form');

    document.getElementById('url').value = "https://api.themoviedb.org/3/movie/popular";

    try {
        const respuestaClave = await fetch('/obtener-clave');
        const laClave = await respuestaClave.text();
        document.getElementById('token').value = laClave;
    } catch (e) {
        console.error("No se pudo cargar la clave desde el servidor");
    }

    actualizarHistorial();
};