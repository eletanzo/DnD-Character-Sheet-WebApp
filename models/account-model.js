/*
This is a module intended to handle the MongoDB connection with our account database
and all operations included with that, including authentication, sessions and encryption.
*/
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const DATABASENAME = 'accountDB'
const SALT_WORK_FACTOR = 10 // Default, can be increased for further passes and increased randomness

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

const AccountSchema = mongoose.Schema({
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
    password: {
        type: String,
        required: true,
        
    }
}, {
    // Static functions built into the schema, callable by Account.staticFunctionName()
    methods: {
        // Checks candidatePassword against the hashed password. Calls the callback function with an err or boolean 'passed'
        authenticate(candidatePassword, next) {
            bcrypt.compare(candidatePassword, this.password, function(err, passed) {
                if (err) return next(err)
                next(null, passed)
            })
        }
    }
})

// Called any time an account is saved. This checks if the passwords needs hashing
// Salt is appended to the beginning of a password hash automatically by bcrypt
AccountSchema.pre('save', function(next) {

    var user = this

    // Hash password only if password is modified (modified includes new)
    if (!user.isModified('password')) return next()
    else {
        // generate a salt and hash the password
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) return next(err)
                // Replaces plaintext password with hashed password
                user.password = hash
                next()
            })
        })
    }
})

module.exports = mongoose.model('Account', AccountSchema)