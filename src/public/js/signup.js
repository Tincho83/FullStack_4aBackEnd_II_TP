const loginForm = document.getElementById('loginForm');

const firstname = document.getElementById('firstname');
const lastname = document.getElementById('lastname');
const e_mail = document.getElementById('email');
//const roles = document.getElementById('role');
const passw = document.getElementById('password');
const aged = document.getElementById('age');
const btnSubmit = document.getElementById('login-btn');
const btnGetCookie = document.getElementById('getcookie-btn');
const btnDelCookie = document.getElementById('delcookie-btn');

btnSubmit.addEventListener("click", async (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

    let first_name = firstname.value;
    let last_name = lastname.value;
    let email = e_mail.value;
    let password = passw.value;
    let age = aged.value;

    //let role = "user";

    // || !role
   

    if (!first_name || !last_name || !email || !age || !password) {
        alert('Complete Datos');
        return;
    }


    // if (!role) { role = "user"; }

    // role,
    let body = { first_name, last_name, email, age, password }

    let cookieFirm = {
        "user": email
    };

    let respuesta = await fetch("/api/sessions/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })

    let datos = await respuesta.json();
    if (respuesta.status >= 400) {
        console.log(datos.error);
        alert(datos.error);
    } else {
        let respcookie = await fetch("/api/cookies/setcookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cookieFirm)
        })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                //alert('Cookie creada');
            })
            .catch(error => console.error('Error:', error));

        window.location.href = `/login?mensaje=Registo Correcto ${datos.newuser.email}`; //marca
    }

})


btnGetCookie.addEventListener("click", async (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

    let respcookie = await fetch("/api/cookies/getcookie", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Cookies:', data);
            alert('Revisa la consola para ver las cookies');
        })
        .catch(error => console.error('Error:', error));

})

btnDelCookie.addEventListener("click", async (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

    let respcookie = await fetch("/api/cookies/delcookie", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(response => response.json())
        .then(data => {
            alert('Cookie eliminada');
        })
        .catch(error => console.error('Error:', error));

})