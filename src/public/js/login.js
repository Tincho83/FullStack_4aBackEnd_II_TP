const cargarDatosToken = async () => {
    let respuestatoken = await fetch("/api/products", {
    });

    if (respuestatoken.status >= 400) {
        alert(respuestatoken.statusText);
    } else {
        let datos = await respuestatoken.json();
    }
};

const loginForm = document.getElementById('loginForm');

const e_mail = document.getElementById('email');
const passw = document.getElementById('password');
const btnSubmit = document.getElementById('login-btn');
const btnLoginGitHub = document.getElementById('logingithub-btn');


const params = new URLSearchParams(window.location.search);

let mensaje = params.get("mensaje");
if (mensaje) {
    alert(mensaje);
}

btnLoginGitHub.addEventListener("click", async (event) => {
    window.location.href = `/api/sessions/github`;
})

btnSubmit.addEventListener("click", async (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

    let email = e_mail.value;
    let password = passw.value;

    if (!email || !password) {
        alert('Complete Datos');
        return;
    }

    let body = { email, password }

    let respuesta = await fetch("/api/sessions/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })

    let datos = await respuesta.json();
    if (respuesta.status >= 400) {
        alert("Credenciales Invalidas.");
        //let { error } = await respuesta.json();
        //console.log("login_js: respuesta.error: ", respuesta.error);
        //console.log("login_js: error: ", error);
        //alert(respuesta.error);
    } else {
        cargarDatosToken();
        window.location.href = `/products`;
    }

})