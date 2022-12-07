/*
This is a module intended to handle the MongoDB connection with our account database
and all operations included with that, including authentication, sessions and encryption.
*/
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const DATABASENAME = 'accountDB'

mongoose.connect(
    `mongodb://127.0.0.1:27017/${DATABASENAME}`, 
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (!err) console.log(`Mongoose connected successfully to ${DATABASENAME}`)
        else throw err
    })

const validateEmail = function(email) {
    var emailRegX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRegX.test(email)
}

const accountSchema = mongoose.Schema({
    username: {
        type: String,
        required: 'A username is required',
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: 'An email address is required',
        unique: true,
        lowercase: true,
        trim: true,
        validate: [
            validateEmail,
            'Provided email address is not valid'
        ],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Provided email address is not valid'
        ]
    },
    aversions: [String] // Allergies/ingredients user wishes to avoid
    
})

const options = {}

accountSchema.plugin(passportLocalMongoose, options)

module.exports = mongoose.model('accounts', accountSchema)