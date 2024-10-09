const loginForm = document.getElementById('loginForm');

const e_mail = document.getElementById('email');
const passw = document.getElementById('password');
const btnSubmit = document.getElementById('login-btn');

const params = new URLSearchParams(window.location.search);

let mensaje = params.get("mensaje");
if(mensaje){
    alert(mensaje);
}

console.log("login.js");

btnSubmit.addEventListener("click", async (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

    console.log("submit clic");

    let email = e_mail.value;
    let password = passw.value;

    console.log("email: ", email);
    console.log("pass: ", password);

    if ( !email || !password) {
        alert('Complete Datos');
        return;
    }

    let body = { email, password }

    console.log("fetch para /login");
    let respuesta = await fetch("/api/sessions/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })

    console.log("revisar respuesta");
    let datos = await respuesta.json();
    console.log("Redirigir o mostrar error");
    if (respuesta.status >= 400) {
        console.log(datos.error);
        alert(datos.error);
    } else {
        window.location.href = `/profile`;
    }

})