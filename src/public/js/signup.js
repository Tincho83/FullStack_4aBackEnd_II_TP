const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada
    
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;

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
