const Account = require('../models/account-model')

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

module.exports = {
    homeView,
    errorView,
    loginView,
    registerView,
    characterView,
    loginProcess,
    registerProcess
}