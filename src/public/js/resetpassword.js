const loginForm = document.getElementById('resetpassForm');

const e_mail = document.getElementById('email');
const passw = document.getElementById('newpassword');
const btnSubmit = document.getElementById('resetpass-btn');

btnSubmit.addEventListener("click", async (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

    let email = e_mail.value;
    let password = passw.value;

    if (!email || !password) {
        alert('Complete Datos');
        return;
    }

    let body = { email, password }

    let respuesta = await fetch("/api/sessions/resetpassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })

    let datos = await respuesta.json();
    if (respuesta.status >= 400) {
        console.log(datos.error);
        alert(datos.error);
    } else {               
        window.location.href = `/login?mensaje=Reset Correct for: ${datos.result.email}, try login. `;
    }

})