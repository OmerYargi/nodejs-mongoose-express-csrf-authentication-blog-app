const express = require('express');
const app = express();
var path = require('path');

// ================================================================== //
//                          SESSION CODES                             //
// ================================================================== //
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/node-app-test',
    collection: 'mySessions'
});
// Catch errors
store.on('error', function (error) {
    console.log(error);
});
app.use(require('express-session')({
    secret: 'test',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: false,
    saveUninitialized: false,
}));

// ================================================================== //
//                                 CSRF                               //
// ================================================================== //
const { csrfSync } = require("csrf-sync");
const { csrfSynchronisedProtection } = csrfSync({
    getTokenFromRequest: (req) => {
        // return req.headers['x-csrf-token'];
        return req.session.csrfToken;
    },
});
app.use(csrfSynchronisedProtection);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


const users = require('./Models/Schema_user.js');
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        users.findById(req.session.user._id)
            .then(data => {
                req.user = data;
                next();
            })
            .catch(err => console.log(err));
    }

});


const indexRouter = require("./routes/index.js");
const AccountRouter = require("./routes/account.js");
app.use("/", indexRouter);
app.use(AccountRouter);


const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});