document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#registrationForm");
  const signupPasswordField = form.querySelector("#signup-password");
  const confirmPasswordField = form.querySelector("#signup-confirm-password");

  function validatePasswords() {
    const password = signupPasswordField.value;
    const confirmPassword = confirmPasswordField.value;
    if (password !== confirmPassword) {
      confirmPasswordField.setCustomValidity("Password tidak sama");
    } else {
      confirmPasswordField.setCustomValidity("");
    }
  }

  signupPasswordField.addEventListener("input", validatePasswords);
  confirmPasswordField.addEventListener("input", validatePasswords);

  form.addEventListener("submit", (event) => {
    if (signupPasswordField.value !== confirmPasswordField.value) {
      event.preventDefault();
      alert("Password tidak sama. Tolong periksa kembali.");
    }
  });

  const showSignupPasswordCheckbox = document.querySelector(
    "#signup-show-password"
  );
  showSignupPasswordCheckbox.addEventListener("change", function () {
    if (this.checked) {
      signupPasswordField.type = "text";
      confirmPasswordField.type = "text";
    } else {
      signupPasswordField.type = "password";
      confirmPasswordField.type = "password";
    }
  });

});

document.addEventListener("DOMContentLoaded", function () {
  const showLoginPasswordCheckbox = document.querySelector("#login-show-password");
  const loginPasswordField = document.querySelector("#login-password");

  showLoginPasswordCheckbox.addEventListener("change", function () {
    if (this.checked) {
      loginPasswordField.type = "text";
    } else {
      loginPasswordField.type = "password";
    }
    console.log("Event listener fired!");
  });
});