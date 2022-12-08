// Javascript unique to the registration page, including basics such as front-end validation and other methods not needed by other pages

// $(document).ready(function () {
//     $('#password').on('keyup', () => {

//     })
//     $('form').submit((event) => {
//         var formData = {
//             username: $('#username').val(),
//             email: $('#email').val(),
//             password: $('#password').val(),
//             verifyPassword: $('#verify-password').val()
//         }
//     })
// })

var password
var verifyPassword

var requirementLength
var requirementSpecial
var requirementNumber
var requirementMatch

const specialChars = " !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~".split('')
const numbers = "1234567890".split('')
const capitals = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')

function validateUsername(username) {
    if (username.value.length < 4) return false
}

function validateEmail(email) {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
}

function validatePassword(e) {
    
    let valid = true

    // Repeated password matches
    if (password.value && password.value !== verifyPassword.value) { valid = false }

    // Password is at least 8 characters long
    if (password.value.length > 7) {
        requirementLength.style.color = "green"
    } else {
        requirementLength.style.color = "black"
        valid = false
    }

    // Password contains a special character
    if (specialChars.some(c => password.value.includes(c))) {
        requirementSpecial.style.color = "green"
    } else {
        requirementSpecial.style.color = "black"
        valid = false
    }

    // Password contains a number
    if (numbers.some(c => password.value.includes(c))) {
        requirementNumber.style.color = "green"
    } else {
        requirementNumber.style.color = "black"
        valid = false
    }

    // Password contains a capital letter
    if (capitals.some(c => password.value.includes(c))) {
        requirementCapital.style.color = "green"
    } else {
        requirementCapital.style.color = "black"
        valid = false
    }

    // Password and repeated password match
    if (!password.value === verifyPassword.value) {
        valid = false
    }

    if (valid) {
        submit.classList.remove('disabled')
    } else {
        submit.classList.add('disabled')
    }

}

function validateRegister(form) {

    let valid = true

    if (validateEmail(form.email.value)) {
        document.getElementById('email-err').style.display = "none"
    } else {
        document.getElementById('email-err').style.display = "block"
        valid =  false
    }

    if ( validatePassword() ) {
        document.getElementById('password-err').style.display = "none"
    } else {
        document.getElementById('password-err').style.display = "block"
        valid = false
    }

    return valid
}


function initRegister() {

    username = document.getElementById('username')
    username = document.getElementById('email')
    password = document.getElementById('password')
    verifyPassword = document.getElementById('verify-password')
    submit = document.getElementById('register-submit')

    requirementLength = document.getElementById('req-len')
    requirementSpecial = document.getElementById('req-spec')
    requirementNumber = document.getElementById('req-num')
    requirementCapital = document.getElementById('req-cap')


    password.addEventListener('keyup', (validatePassword))
    verifyPassword.addEventListener('keyup', validatePassword)



}