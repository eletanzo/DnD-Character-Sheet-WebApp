const {Account} = require('../models/account-model')
const {Character} = require('../models/account-model')


// const Character = require('../models/character-model')

const render = (req, res, root_page_path, title) => {
    res.render('frame', { page: root_page_path, title: title}, (err, html) => {
        if (err) console.log(err)
        else res.status(200).send(html)
    })
}

// Publicly-available views
const homeView = (req, res) => { render(req, res, 'content/home', 'Home') }
const errorView = (req, res) => { render(req, res, 'content/error', 'Error!') }
const loginView = (req, res) => { render(req, res, 'content/login', 'Login') }
const registerView = (req, res) => { render(req, res, 'content/register', 'Register') }


// Authenticated-only views
const characterView = (req, res) => { render(req, res, 'auth/character', 'Character Sheet')}

const loginProcess = (req, res, next) => {
    req.session.regenerate((err) => {
        if (err) return next(err)
        Account.findOne({ 'username': req.body.username }, (err, account) => {
            if (err) return next(err)
            else if (!account) { // No error but no account means wrong username
                req.flash('error', 'The username you entered is incorrect. Please try again')
                res.redirect('/login')
            } else {
                account.authenticate(req.body.password, (err, passed) => {
                    if (err) return next(err) // if authenticate() failed, it should pass an error, and account should be passed instead
                        // User session info stored under req.session.user object. Check req.session.user for authentication
                    if (passed) {
                        req.session.user = {
                            userid: account._id,
                            username: account.username
                        }
                        req.session.save((err) => {
                            if (err) return next(err)
                            req.flash('success', `You're all logged in!`)
                            res.redirect('/')
                        })
                    } else {
                        req.flash('error', 'The password you entered is incorrect. Please try again')
                        res.redirect('/login')
                    }
                })
            }
            
        })
        
    })
}

const registerProcess = (req, res, next) => {
    Account.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password // Password is hashed by default from the .pre('save',...) in model
    }, (err, newAccount) => {
        if (err) return next(err)
        req.flash('success', 'Registration successful! Feel free to log in now')
        res.redirect('/login')
    })
}

const characterProcess = (req, res, next) => {
    console.log(req.body)
    Character.create({
        name: req.body['character-name'],
        // class: req.body[''],
        background: req.body.background,
        playerName: req.body['player-name'],
        race: req.body.race,
        alignment: req.body.alignment,
        experience: req.body.experience,
        strength: req.body['attr-strength'],
        dexterity: req.body['attr-dexterity'],
        constitution: req.body['attr-constitution'],
        intelligence: req.body['attr-intelligence'],
        wisdom: req.body['attr-wisdom'],
        charisma: req.body['attr-charisma'],
        proficiencyBonus: req.body['proficiency-bonus'],
        passivePerception: req.body['passive-perception'],
        otherProficiencies: req.body['other-proficiencies'],
        armorClass: req.body['armor-class'],
        initiative: req.body.initiative,
        speed: req.body.speed,
        hitPointMaximum: req.body['hitpoint-maximum'],
        currentHitPoints: req.body['current-hitpoints'],
        temporaryHitPoints: req.body['temporary-hitpoints'],
        totalHitDice: req.body['total-hit-dice'],
        hitDie: req.body['hit-die'],
        currentHitDice: req.body['current-hit-dice'],
        attackName: req.body['attack-name'],
        attackBonus: req.body['attack-bonus'],
        attackDamage: req.body['attack-damage'],
        miscAttacksSpellcasting: req.body['misc-attacks-and-spellcasting'],
        equipment: req.body.equipment,
        personalityTraits: req.body['personality-traits'],
        ideals: req.body.ideals,
        bonds: req.body.bonds,
        flaws: req.body.flaws,
        featuresAndTraits: req.body['features-and-traits']
    }, (err, newCharacter) => {
        if (err) return next(err)
        req.flash('success', 'Character created!')
        res.redirect('/character')
    })
}



module.exports = {
    homeView,
    errorView,
    loginView,
    registerView,
    characterView,
    loginProcess,
    registerProcess,
    characterProcess
}