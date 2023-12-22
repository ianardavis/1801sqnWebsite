var express  = require('express'),
    app      = express(),
    passport = require('passport'),
    session  = require('express-session'),
    flash    = require('connect-flash'),
    bb       = require('express-busboy'),
    memStore = require('memorystore')(session);
require('dotenv').config();
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
const port_check = require(`${process.env.ROOT}/functions/port_check.js`);
port_check()
.then(port => {
    let m = {};
    m = require(`${process.env.ROOT}/database/models`);
    require(`${process.env.ROOT}/database/associations`)(m);

    bb.extend(app, {
        arrayLimit:  200,
        upload:      true,
        path:        `${process.env.ROOT}/public/uploads`,
        allowedPath: /./
    });
    app.use(
        session({
            secret: process.env.SECRET,
            store:  new memStore({checkPeriod: 86400000}),
            resave: true,
            saveUninitialized: true
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());
    require(`${process.env.ROOT}/functions/passport.js`)(passport, m);

    app.use(flash());
    app.use(require(`${process.env.ROOT}/middleware/variables.js`)());
    app.set('view engine', 'ejs');
    app.use(express.static(`${__dirname}/public`));
    require(`${process.env.ROOT}/routes`)(app, m);
    
    app.listen(port, err => {
        if (err) {
            console.log(err);

        } else {
            console.log(`${new Date().toLocaleString()}: Server listening on port: ${port}. Environment: ${process.env.NODE_ENV}`);
        
        };
    });
})
.catch(err => console.log(err));