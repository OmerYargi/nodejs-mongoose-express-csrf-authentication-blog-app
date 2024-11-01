var express = require('express');
const users = require('../Models/Schema_user');
var router = express.Router();

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
// javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("");

const { csrfSync } = require("csrf-sync");
const { generateToken } = csrfSync();


// ================================= //
/* GET LOGIN */
// ================================= //
router.get('/login', function (req, res, next) {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render("./account/login.pug", {
        path: "/login",
        title: "Login",
        isAuthenticated: req.session.isAuthenticated,
        CSRFToken: generateToken(req, true),
        errorMessage: errorMessage,
    });
});



// ================================= //
/* POST LOGIN */
// ================================= //
router.post("/login", async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    await users.findOne(email).then(async (data) => {
        // KULLANICI MAIL ADRESİ BULUNMAZSA HATA VERECEKTİR.
        if (!data) {
            req.session.errorMessage = "Bu e-posta adresi ile bir kayıt bulunamamıştır!";
            req.session.save(err => {
                console.log(err);
                return res.redirect("/login");
            });
        } else {
            // HATA YOKSA DEVAM EDECEKTİR.
            const isMatch = await bcrypt.compare(password, data.password);
            if (isMatch) {
                req.session.user = data;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) return err;
                    var url = req.session.redirectTo || "/";
                    delete req.session.redirectTo;
                    res.redirect(url);
                });
            } else {
                req.session.errorMessage = "HATALI ŞİFRE GİRİŞİ";
                res.redirect("/login")
            }
        }
    }).catch(err => console.log(err));
});




// ================================= //
/* GET REGISTER */
// ================================= //
router.get('/register', function (req, res, next) {
    res.render("./account/register.pug", {
        path: "/register",
        title: "Register",
        isAuthenticated: req.session.isAuthenticated,
        CSRFToken: generateToken(req, true),
    });
});



// ================================= //
/* POST REGISTER */
// ================================= //
router.post("/register", async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    await users.findOne(email).then(async (data) => {

        if (data) {
            console.log("E-POSTA ADRESİ KULLANILMAKTADIR!!!");
            return res.redirect("/register")
        };

        bcrypt.hash(password, 10)
            .then(async (hash) => {
                await users.addUser({
                    name: name,
                    email: email,
                    password: hash
                });

                res.redirect("/login");
            })
            .catch(err => console.log(err));
    })
});


// ================================= //
/* GET RESET-PASSWORD */
// ================================= //
router.get("/reset-password", (req, res, next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;

    res.render("./account/reset-password.pug", {
        path: "/reset-password",
        title: "Reset Password",
        isAuthenticated: req.session.isAuthenticated,
        CSRFToken: generateToken(req, true),
        errorMessage: errorMessage,
    });
});



// ================================= //
/* POST RESET-PASSWORD */
// ================================= //
router.post("/reset-password", (req, res, next) => {

    const email = req.body.email;

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect("/reset-password");
        }
        const token = buffer.toString("hex");

        users.findOne(email)
            .then(async (user) => {
                if (!user) {
                    req.session.errorMessage = "Bu e-posta adresi ile bir kayıt bulunamamıştır!";
                    req.session.save(err => {
                        console.log(err);
                        return res.redirect("/reset-password");
                    });
                } else {
                    user.resetToken = token;
                    user.resetTokenExpiration = Date.now() + 3600000;
                    return await user.save();
                }
            })
            .then(() => {
                res.redirect("/login");
                const msg = {
                    to: email, // Change to your recipient
                    from: 'yarginomerfaruk@gmail.com', // Change to your verified sender
                    subject: 'Hesap Oluşturuldu',
                    text: "and easy to do anywhere, even with Node.js",
                    html: `
                        <h1>Parola Sıfırlama İsteği</h1>
                        <a href="http://localhost:3000/new-password/${token}">Reset Password</a>
                    `,
                };
                sgMail
                    .send(msg)
                    .then(() => {
                        console.log('Email sent')
                    })
                    .catch((error) => {
                        console.error(error)
                    });
            })
            .catch(err => console.log(err));
    })
});



// ================================= //
/* GET PASSWORD UPDATE */
// ================================= //
router.get("/new-password/:token", (req, res, next) => {
    const token = req.params.token;

    users.findByToken(token).then(user => {
        res.render("./account/new-password.pug", {
            path: "/reset-password",
            title: "Reset Password",
            isAuthenticated: req.session.isAuthenticated,
            CSRFToken: generateToken(req, true),
            userId: user._id,
            passwordToken: token,
        });
    }).catch(err => console.log(err));
});



// ================================= //
/* POST PASSWORD UPDATE */
// ================================= //
router.post("/new-password", (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    users.findByTokenAndId(passwordToken, userId).then(user => {

        bcrypt.hash(newPassword, 10).then(async (hash) => {
            user.password = hash;
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            user.save().then(() => res.redirect("/login")).catch(err => console.log(err));
        }).catch(err => console.log(err));

    }).catch(err => console.log(err));
});




// ================================= //
/* GET LOGOUT */
// ================================= //
router.get("/logout", (req, res, next) => {
    req.session.destroy(err => {
        if (err) console.log(err);
        res.redirect("/");
    });
});






module.exports = router;