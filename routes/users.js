const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Token = require("../models/Token");
const Reset = require('../models/Reset')
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const hashPassword = require("../utils/hashPassword");
const comparePass = require("../utils/comparePass");

router.get('/logout', (req, res) => {
    //login değilse logout olamaz
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }

    req.session.destroy(() => {
        res.redirect('/');
    })
})


router.get('/login', (req, res) => {
    try { 
        if(req.session.userId){
            return res.redirect('/');
        }
    } catch (error) {
        return res.redirect('/');
    }
    res.render('site/login');
})


router.post('/login', (req, res) => {
    //login olanlar ulaşamaz.
    try { 
        if(req.session.userId){
            return res.redirect('/');
        }
    } catch (error) {
        return res.redirect('/');
    }

    User.findOne({ email: req.body.email }, (error, user) => {
        if (user) {
            user.comparePassword(req.body.password, (matchError, isMatch) => {
                if (matchError) {
                    throw matchError;
                }
                else if (isMatch) {
                    if(user.banned){
                        req.session.sessionFlash = {
                            type: 'alert alert-danger',
                            message: 'Hesabınız yasaklanmıştır'
                        }
                        return res.redirect('/users/login');
                    }
                    req.session.userId = user._id;
                    req.session.verify = user.verified;
                    req.session.passKey = crypto.randomBytes(32).toString("hex");
                    req.session.auth = user.auth;
                    console.log(req.session)
                    res.redirect('/');
                }
                else if (!isMatch) {
                    req.session.sessionFlash = {
                        type: 'alert alert-danger',
                        message: 'Kullanıcı adı veya şifre hatalı.'
                    }
                    res.redirect('/users/login')
                }
            })
        }
        else {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Girdiğiniz e-posta adresi kayıtlı değil.'
            }
            res.redirect('/users/register')
        }
    })
})

router.get('/register', (req, res) => {
    try { 
        if(req.session.userId){
            return res.redirect('/');
        }
    } catch (error) {
        return res.redirect('/');
    }

    res.render('site/register');
})


router.post('/register', (req, res) => {
    //login olanlar kayıt olamaz.
    try { 
        if(req.session.userId){
            return res.redirect('/');
        }
    } catch (error) {
        return res.redirect('/');
    }
    //empty string control
    if ((/^\s*$/.test(req.body.username))) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Kullanıcı adı alanı boş bırakılamaz.'
        }
        return res.redirect('/users/register');
    }
    else if ((/^\s*$/.test(req.body.email))) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Mail alanı boş bırakılamaz.'
        }
        return res.redirect('/users/register');
    }

    //check if params valid
    if (req.body.username.length > 8) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Kullanıcı adı 8 karakterden uzun olamaz.'
        }
        res.redirect('/users/register')
    }
    else if (req.body.password.length > 10 || req.body.password.length < 6) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Parola en az 6 en fazla 10 karakterden oluşabilir.'
        }
        res.redirect('/users/register')
    }
    else {
        //check if user exists, if not create
        User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] }, (error, user) => {
            if (user) {
                req.session.sessionFlash = {
                    type: 'alert alert-danger',
                    message: 'Girdiğiniz kullanıcı adı veya e-posta adresi zaten kullanılmaktadır.'
                }
                res.redirect('/users/register');
            }
            else {
                User.create(req.body, (error, user) => {
                    let token = new Token({
                        userId: user._id,
                        token: crypto.randomBytes(32).toString("hex"),
                    }).save();

                    token.then(t => {
                        const message = `https://nodeblogonline.herokuapp.com/users/verify/${user._id}/${t.token}`;
                        const html = `<h2>Email Verification</h2><p>Please, click the link below to confirm your mail adress</p><p><a href="${message}">Click Here</a></p>`
                        sendEmail(user.email, "Account Verification", html);

                        console.log("An Email sent to your account please verify");
                    })

                    res.redirect('/users/login');
                });

                req.session.sessionFlash = {
                    type: 'alert alert-success',
                    message: 'Hesabınız başarıyla oluşturuldu. Lütfen hesabınızı mail adresinizdeki bağlantı ile doğrulayın.'
                }
            }
        })
    }
})


router.get('/verify', (req, res) => {
    res.render('email/emailverify');
})

router.get("/verify/:id/:token", (req, res) => {

    if (req.params.id.length !== 24 || req.params.token.length !== 64) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Geçersiz bağlantı adresi!'
        }
        return res.redirect('/users/verify')
    }

    User.findOne({ _id: req.params.id }).lean().then(usr => {
        if (!usr || usr.verified === true) {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Geçersiz bağlantı adresi!'
            }
            return res.redirect('/users/verify')
        }

        Token.countDocuments({ userId: req.params.id, token: req.params.token }).lean().then(count => {
            if (count === 0) {
                req.session.sessionFlash = {
                    type: 'alert alert-danger',
                    message: 'Geçersiz bağlantı adresi!'
                }
                return res.redirect('/users/verify')
            }


            User.findOneAndUpdate({ _id: req.params.id }, { $set: { verified: true } }, { new: true }).lean().then(user => {
                console.log(user)
            });

            Token.findOneAndDelete({ userId: req.params.id, token: req.params.token }).lean().then(token => {
                console.log(token);
            })
            //log-out
            if (req.session.userId) {
                delete req.session['userId'];
            }
            req.session.sessionFlash = {
                type: 'alert alert-success',
                message: 'Hesabınız başarıyla doğrulandı!'
            }
            res.redirect('/users/verify')

        })
    })
});

router.get('/verifyaccount', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({ _id: req.session.userId }).lean().then(usr => {
        if (usr.verified === true) {
            console.log('verified already')
            return res.redirect('/');
        }


        Token.deleteMany({ userId: req.session.userId }).lean().then(dt => {
            User.findOne({ _id: req.session.userId }).lean().then(user => {
                let token = new Token({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();

                token.then(t => {
                    const message = `https://nodeblogonline.herokuapp.com/users/verify/${user._id}/${t.token}`;
                    const html = `<h2>Email Verification</h2><p>Please, click the link below to confirm your mail adress</p><p><a href="${message}">Click Here</a></p>`
                    sendEmail(user.email, "Account Verification", html);

                    console.log("An Email sent to your account please verify");

                    req.session.sessionFlash = {
                        type: 'alert alert-success',
                        message: 'E-postaya link gönderildi!'
                    }
                    res.redirect('/users/verify')
                })
            })

        })
    })
})

router.get('/forgetPassword', (req, res) => {
    res.render('email/forgetPassword');
})

router.post('/forgetPassword', (req, res) => {

    User.findOne({ email: req.body.email }).lean().then(user => {
        if (!user) {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Uygun hesap bulunamadı!'
            }
            return res.redirect('/users/forgetPassword')
        }
        Reset.deleteMany({ userId: user._id }).lean().then((dt) => {
            Reset.create({
                userId: user._id,
                intoken: crypto.randomBytes(32).toString("hex"),
                outtoken: crypto.randomBytes(32).toString("hex"),
            }).then(token => {
                const message = `https://nodeblogonline.herokuapp.com/users/forgetPassword/${token.intoken}/${token.outtoken}/${token.userId}`;
                const html = `<h2>Reset Password</h2><p>Please, click the link below to reset your password</p><p><a href="${message}">Click Here</a></p>`
                sendEmail(user.email, "Reset Password", html);

                console.log("An Email sent to your account please verify");

                req.session.sessionFlash = {
                    type: 'alert alert-success',
                    message: 'Mail gönderildi'
                }
                res.redirect('/users/forgetPassword');

            })
        })
    })
})



router.get('/forgetPassword/:intoken/:outtoken/:id', (req, res) => {
    if (req.params.intoken.length !== 64 || req.params.outtoken.length !== 64 || req.params.id.length !== 24) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Geçersiz bağlantı adresi!'
        }
        return res.redirect('/users/verify')
    }

    Reset.findOne({ intoken: req.params.intoken, outtoken: req.params.outtoken, userId: req.params.id }).lean().then(reset => {
        if (!reset) {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Geçersiz bağlantı adresi'
            }
            return res.redirect("/users/verify")

        }
        res.render('email/changePassword');

        router.post('/changePassword', async (req, res) => {
            if (!(req.body.password === req.body.passwordConfirm)) {
                req.session.sessionFlash = {
                    type: "alert alert-danger",
                    message: "Parolalar eşleşmiyor."
                }

                return res.render('email/changePassword', { sessionFlash: req.session.sessionFlash });
            }
            const pass = await hashPassword(await req.body.password)
            User.findOneAndUpdate({ _id: reset.userId }, { $set: { password: pass } }, { new: true }).lean().then(usr => {
                console.log(usr);
                return usr;
            }).then((usr) => {
                Reset.deleteOne({ userId: usr._id }).lean().then(dt => {
                    console.log(dt)
                    return res.redirect('/')
                })
            })
        })
    })
})

router.get('/passChange/:token', async (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    if (!(req.params.token === req.session.passKey)) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Geçersiz bağlantı adresi'
        }
        return res.redirect('/users/verify')
    }
    res.render('email/alterPassword')

    router.post('/alterPass', async (req, res) => {
        try { 
            if(!req.session.userId){
                return res.redirect('/users/login');
            }
        } catch (error) {
            return res.redirect('/');
        }
        if (!(req.body.password === req.body.passwordConfirm)) {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Parolalar eşleşmiyor.'
            }
            return res.render('email/alterPassword', { sessionFlash: req.session.sessionFlash })
        }
        User.findOne({ _id: req.session.userId }).lean().then(user => {
            if (!user) {
                req.session.sessionFlash = {
                    type: 'alert alert-danger',
                    message: 'Beklenmeyen veri tabanı hatası.'
                }
                return res.render('email/alterPassword', { sessionFlash: req.session.sessionFlash })
            }
            comparePass(req.body.currentPassword, user.password).then(isMatch => {
                if (isMatch) {
                    hashPassword(req.body.password).then(pass => {
                        User.findOneAndUpdate({ _id: req.session.userId }, { $set: { password: pass } }, { new: true }).then(us => {
                            console.log(us)
                        })
                    })
                    req.session.sessionFlash = {
                        type: 'alert alert-success',
                        message: 'Parolanız başarıyla değiştirildi.'
                    }
                    //new token
                    req.session.passKey = crypto.randomBytes(32).toString("hex");
                    return res.render('email/alterPassword', { sessionFlash: req.session.sessionFlash })
                }
                else if (!isMatch) {
                    req.session.sessionFlash = {
                        type: 'alert alert-danger',
                        message: 'Mevcut parola yanlış.'
                    }
                    //new token
                    req.session.passKey = crypto.randomBytes(32).toString("hex");
                    return res.render('email/alterPassword', { sessionFlash: req.session.sessionFlash })
                }
            })
        })
    })
})




module.exports = router;