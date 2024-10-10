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

console.log("signup.js");

btnSubmit.addEventListener("click", async (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

    console.log("signup.js >>> submit clic");


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

    console.log("firstname:", first_name);
    console.log("lastname:", last_name);
    console.log("email:", email);
    console.log("age:", age);
    //console.log("role:", role);
    console.log("Password:", password);

    // role,
    let body = { first_name, last_name, email, age, password }

    let cookieFirm = {
        "user": email
    };

    console.log("fetch para /signup");
    let respuesta = await fetch("/api/sessions/signup", {
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
        console.log("generar cookie");
        console.log(cookieFirm);
        console.log("fetch para /setcookie");
        console.log("Revisar log desde App Backend");
        let respcookie = await fetch("/api/cookies/setcookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cookieFirm)
        })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                alert('Cookie creada');
            })
            .catch(error => console.error('Error:', error));

        console.log("Redirigir");
        window.location.href = `/login?mensaje=Registo Correcto ${datos.newuser.email}`; //marca
    }

})


btnGetCookie.addEventListener("click", async (event) => {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

    console.log("signup.js >>> getcookie clic");
    
    console.log("fetch para /getcookie");
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

    console.log("signup.js >>> delcookie clic");
    
    console.log("fetch para /delcookie");

    let respcookie = await fetch("/api/cookies/delcookie", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Cookies:', data);
        console.log('Cookies eliminada');
        alert('Cookie eliminada');
    })
    .catch(error => console.error('Error:', error));

})




/*
loginForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const btnSubmit = document.getElementById('login-btn').value;

    // Aquí puedes añadir tu lógica de autenticación
    console.log("firstname:", firstname);
    console.log("lastname:", lastname);
    console.log("email:", email);
    console.log("role:", role);
    console.log("Password:", password);

    // Simulación de autenticación
    if (firstname === 'user' && password === 'password') {
        alert('Login successful!');
    } else {
        alert('Invalid credentials');
    }
});
*/

