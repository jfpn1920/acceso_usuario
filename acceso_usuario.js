// ===== REFERENCIAS A LOS ELEMENTOS DEL HTML =====
const vistaAcceso = document.getElementById('vistaAcceso');
const vistaBienvenida = document.getElementById('vistaBienvenida');
const formulario = document.getElementById('formulario');
const inputUsuario = document.getElementById('usuario');
const inputClave = document.getElementById('clave');
const inputConfirmar = document.getElementById('confirmar');
const campoConfirmar = document.getElementById('campoConfirmar');
const verClave = document.getElementById('verClave');
const mensaje = document.getElementById('mensaje');
const btnEnviar = document.getElementById('btnEnviar');
const nombreUsuario = document.getElementById('nombreUsuario');
const btnSalir = document.getElementById('btnSalir');
const pestanas = document.querySelectorAll('.pestana');
// ===== CLAVES DE LOCALSTORAGE =====
const CLAVE_USUARIOS = 'acceso_usuarios';  // cuentas creadas
const CLAVE_SESION = 'acceso_sesion';      // usuario con sesión iniciada
const CLAVE_BORRADOR = 'acceso_borrador';  // usuario escrito en el formulario
// ===== LEER DATOS GUARDADOS =====
// Devuelve el valor guardado (convertido de texto a objeto) o uno por defecto
function leerStorage(clave, porDefecto) {
    try {
        const guardado = localStorage.getItem(clave);
        return guardado ? JSON.parse(guardado) : porDefecto;
    } catch (error) {
        return porDefecto;
    }
}
// Al cargar la página recuperamos las cuentas creadas
// OJO: guardar contraseñas así es solo para practicar, nunca en un proyecto real
let usuarios = leerStorage(CLAVE_USUARIOS, []);
let modo = 'login';  // puede ser "login" o "registro"
// ===== MOSTRAR UN MENSAJE DEBAJO DEL FORMULARIO =====
function mostrarMensaje(texto, esExito = false) {
    mensaje.textContent = texto;
    mensaje.classList.toggle('exito', esExito);  // verde si es éxito, rojo si es error
}
// ===== CAMBIAR ENTRE "INICIAR SESIÓN" Y "CREAR CUENTA" =====
function cambiarModo(nuevoModo) {
    modo = nuevoModo;
    const esRegistro = modo === 'registro';
    campoConfirmar.hidden = !esRegistro;  // el campo "confirmar" solo se ve al registrarse
    btnEnviar.textContent = esRegistro ? 'Crear cuenta' : 'Iniciar sesión';
    pestanas.forEach(p => p.classList.toggle('activa', p.dataset.modo === modo));
    mostrarMensaje('');
}
// ===== CREAR UNA CUENTA =====
function registrar(nombre, clave, confirmar) {
    // Validaciones: si algo está mal, mostramos el error y salimos
    if (nombre.length < 3) return mostrarMensaje('El usuario debe tener al menos 3 caracteres.');
    if (clave.length < 4) return mostrarMensaje('La contraseña debe tener al menos 4 caracteres.');
    if (clave !== confirmar) return mostrarMensaje('Las contraseñas no coinciden.');
    // Revisamos que el usuario no exista (sin importar mayúsculas)
    const existe = usuarios.some(u => u.nombre.toLowerCase() === nombre.toLowerCase());
    if (existe) return mostrarMensaje('Ese usuario ya existe.');
    usuarios.push({ nombre, clave });
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    inputClave.value = '';
    inputConfirmar.value = '';
    cambiarModo('login');  // pasamos a la pestaña de acceso
    mostrarMensaje('Cuenta creada. Ya puedes iniciar sesión.', true);
}
// ===== INICIAR SESIÓN =====
function iniciarSesion(nombre, clave) {
    // Buscamos una cuenta con ese usuario y esa contraseña
    const cuenta = usuarios.find(u =>
        u.nombre.toLowerCase() === nombre.toLowerCase() && u.clave === clave);
    if (!cuenta) return mostrarMensaje('Usuario o contraseña incorrectos.');
    localStorage.setItem(CLAVE_SESION, JSON.stringify(cuenta.nombre));  // guardamos la sesión
    inputClave.value = '';
    mostrarVista();
}
// ===== CERRAR SESIÓN =====
function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    mostrarMensaje('');
    mostrarVista();
}
// ===== MOSTRAR LA VISTA CORRECTA (acceso o bienvenida) =====
function mostrarVista() {
    const sesion = leerStorage(CLAVE_SESION, null);
    vistaAcceso.hidden = Boolean(sesion);     // con sesión, ocultamos el formulario
    vistaBienvenida.hidden = !sesion;         // sin sesión, ocultamos la bienvenida
    if (sesion) nombreUsuario.textContent = sesion;
}
// ===== ENVIAR EL FORMULARIO =====
function enviarFormulario(evento) {
    evento.preventDefault();  // evita que la página se recargue
    const nombre = inputUsuario.value.trim();
    const clave = inputClave.value;
    if (modo === 'registro') registrar(nombre, clave, inputConfirmar.value);
    else iniciarSesion(nombre, clave);
}
// ===== EVENTOS =====
formulario.addEventListener('submit', enviarFormulario);
btnSalir.addEventListener('click', cerrarSesion);
// Cambia de pestaña al hacer clic
pestanas.forEach(p => p.addEventListener('click', () => cambiarModo(p.dataset.modo)));
// Muestra u oculta la contraseña según la casilla
verClave.addEventListener('change', () => {
    const tipo = verClave.checked ? 'text' : 'password';
    inputClave.type = tipo;
    inputConfirmar.type = tipo;
});
// Guarda el usuario mientras se escribe (la contraseña NUNCA se guarda como borrador)
inputUsuario.addEventListener('input', () => {
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(inputUsuario.value));
});
// ===== INICIO: se ejecuta al cargar o refrescar la página =====
inputUsuario.value = leerStorage(CLAVE_BORRADOR, '');  // recupera el usuario escrito
cambiarModo('login');  // empieza en la pestaña de acceso
mostrarVista();        // si ya había sesión, muestra la bienvenida