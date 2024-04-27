function togglePasswordVisibilityLogin() {
    var checkbox  = document.getElementById('check');
    var passwordInput = document.getElementById("password");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}

function togglePasswordVisibilityRegister() {
    var checkbox  = document.getElementById('check');
    var x = document.getElementById('typePasswordX');
    var y = document.getElementById('typePasswordY');
    if (x.type === "password") {
        x.type = "text";
        y.type = "text";
    } else {
        x.type = "password";
        y.type = "password";
    }
}

window.addEventListener("load", function(){
var checkbox  = document.getElementById('{{ register.show_password.id }}');

checkbox.addEventListener('change', function() {
    if(this.checked) {
        x.type = 'text'; 
        y.type = 'text'; 
    } else {
        x.type = 'password'; 
        y.type = 'password'; 
    }
});
});
const form = document.getElementById('registrationForm');
const passwordField = form.querySelector('#typePasswordX');
const confirmPasswordField = form.querySelector('#typePasswordY');

function validatePasswords() {
    const password = passwordField.value;
    const confirmPassword = confirmPasswordField.value;

    if (password !== confirmPassword) {
        confirmPasswordField.setCustomValidity("Password tidak sama");
    } else {
        confirmPasswordField.setCustomValidity("");
    }
}

passwordField.addEventListener('input', validatePasswords);
confirmPasswordField.addEventListener('input', validatePasswords);

form.addEventListener('submit', (event) => {
    if (passwordField.value !== confirmPasswordField.value) {
        event.preventDefault(); 
        alert("Password tidak sama. Tolong periksa kembali.");
    }
});

