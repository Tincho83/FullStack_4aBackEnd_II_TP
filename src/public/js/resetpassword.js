const loginForm = document.getElementById('resetpassForm');

const e_mail = document.getElementById('email');
const passw = document.getElementById('newpassword');
const btnSubmit = document.getElementById('resetpass-btn');

console.log("resetpassword.js");

btnSubmit.addEventListener("click", async (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

    console.log("resetpassword.js >>> submit clic");

    let email = e_mail.value;
    let password = passw.value;

    if (!email || !password) {
        alert('Complete Datos');
        return;
    }

    console.log("email:", email);
    console.log("Password:", password);

    let body = { email, password }

    console.log("fetch para /resetpassword");
    let respuesta = await fetch("/api/sessions/resetpassword", {
        method: "PUT",
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
        console.log("Redirigir");
        window.location.href = `/login?mensaje=Reset Correcto ${datos.result.email}`;
    }

})