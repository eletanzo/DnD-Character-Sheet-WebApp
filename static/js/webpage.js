// Generic JS file for whatever javascript functionality is needed by any page

function validateEmail(email) {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
}

function capitalize(word) {
    return word[0].toUpperCase() + word.substring(1)
}