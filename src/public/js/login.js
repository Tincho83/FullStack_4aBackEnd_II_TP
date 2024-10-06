const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Aquí puedes añadir tu lógica de autenticación
    console.log("Username:", username);
    console.log("Password:", password);

    // Simulación de autenticación
    if (username === 'user' && password === 'password') {
        alert('Login successful!');
    } else {
        alert('Invalid credentials');
    }
});
