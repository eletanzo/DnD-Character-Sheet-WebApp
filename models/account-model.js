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


const CharacterSchema = mongoose.Schema({
    playerName: {
        type: String,
        required: false,
        // trim: true
    },
    name: {
        type: String,
        required: false,
        // trim: true
    },
    race: {
        type: String,
        required: false
    },
    class: {
        type: String,
        required: false
    },
    level: {
        type: Number,
        required: false
    },
    experience: {
        type: Number,
        required: false
    },
    stats: {
        strength: Number,
        dexterity: Number,
        constitution: Number,
        intelligence: Number,
        wisdom: Number,
        charisma: Number
    },
    inventory: {
        type: Array,
        required: false
    },
    equipment: {
        type: Array,
        required: false
    },
    spells: {
        type: Array,
        required: false
    },
    feats: {
        type: Array,
        required: false
    },
    currency: {
        platinum: Number,
        gold: Number,
        electrum: Number,
        silver: Number,
        copper: Number
    },
    health: {
        currentHP: Number,
        maxHP: Number,
        tempHP: Number
    },
    hitDice: {
        remaining: Number,
        max: Number

    },
    savingThrowProficiency: {
        strength: Boolean,
        dexterity: Boolean,
        constitution: Boolean,
        intelligence: Boolean,
        wisdom: Boolean,
        charisma: Boolean
    },
    skillProficiency: {
        acrobatics: Boolean,
        animalHandling: Boolean,
        arcana: Boolean,
        athletics: Boolean,
        deception: Boolean,
        history: Boolean,
        insight: Boolean,
        intimidation: Boolean,
        investigation: Boolean,
        medicine: Boolean,
        nature: Boolean,
        perception: Boolean,
        performance: Boolean,
        persuasion: Boolean,
        religion: Boolean,
        sleightOfHand: Boolean,
        stealth: Boolean,
        survival: Boolean
    },
    skillExpertise: {
        acrobatics: Boolean,
        animalHandling: Boolean,
        arcana: Boolean,
        athletics: Boolean,
        deception: Boolean,
        history: Boolean,
        insight: Boolean,
        intimidation: Boolean,
        investigation: Boolean,
        medicine: Boolean,
        nature: Boolean,
        perception: Boolean,
        performance: Boolean,
        persuasion: Boolean,
        religion: Boolean,
        sleightOfHand: Boolean,
        stealth: Boolean,
        survival: Boolean
    },
    halfProficiency: {
        acrobatics: Boolean,
        animalHandling: Boolean,
        arcana: Boolean,
        athletics: Boolean,
        deception: Boolean,
        history: Boolean,
        insight: Boolean,
        intimidation: Boolean,
        investigation: Boolean,
        medicine: Boolean,
        nature: Boolean,
        perception: Boolean,
        performance: Boolean,
        persuasion: Boolean,
        religion: Boolean,
        sleightOfHand: Boolean,
        stealth: Boolean,
        survival: Boolean
    },
    passivePerception: {
        type: Number,
        required: false
    },
    languages: {
        type: Array,
        required: false
    },
    proficiencies: {
        type: Array,
        required: false
    },
    personalityTraits: {
        type: String,
        required: false
    },
    ideals: {
        type: String,
        required: false
    },
    bonds: {
        type: String,
        required: false
    },
    flaws: {
        type: String,
        required: false
    },
    alignment: {
        type: String,
        required: false
    },
    background: {
        type: String,
        required: false
    },
    armorClass: {
        type: Number,
        required: false
    },
    traits: {
        age : Number,
        height : String,
        weight : String,
        eyes : String,
        skin : String,
        hair : String
    },
    spellSlots: {
        level1: Number,
        level2: Number,
        level3: Number,
        level4: Number,
        level5: Number,
        level6: Number,
        level7: Number,
        level8: Number,
        level9: Number
    },
    spellSlotsUsed: {
        level1: Number,
        level2: Number,
        level3: Number,
        level4: Number,
        level5: Number,
        level6: Number,
        level7: Number,
        level8: Number,
        level9: Number
    },
    spellcasting: {
        spellSaveDC: Number,
        spellAttackBonus: Number,
        spellcastingAbility: String,
        spellcastingClass: String,
        spellcastingLevel: Number,
        spellcastingAbilityModifier: Number,
        spellcastingKnownSpells: Array,
        spellcastingPreparedSpells: Array,
        spellcastingCantrips: Array
    },
    inspiration: {
        type: Boolean,
        required: false
    },
    profBonus: {
        type: Number,
        required: false
    },
    deathSaves: {
        successes: Number,
        failures: Number
    },
    attacks: {
        type: Array,
        required: false
    },
    actions: {
        type: Array,
        required: false
    },
    bonusActions: {
        type: Array,
        required: false
    },
    reactions: {
        type: Array,
        required: false
    },
    legendaryActions: {
        type: Array,
        required: false
    },
    initiative: {
        type: Number,
        required: false
    },
    speed: {
        type: Number,
        required: false
    }
})
Character = mongoose.model('Character', CharacterSchema)
Account = mongoose.model('Account', AccountSchema)
module.exports = {
    Character : Character,
    Account : Account
}
