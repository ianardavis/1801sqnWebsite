var express  = require('express'),
    app      = express(),
    passport = require('passport'),
    session  = require('express-session'),
    bb       = require('express-busboy'),
    flash    = require('connect-flash'),
    memStore = require('memorystore')(session);
process.env.ROOT = __dirname;
let port = require(process.env.ROOT + '/fn/port'),
   _port = 3000;
port.check(_port)
.then(result => {
    console.log(result);
    if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
    console.log('environment: ' + process.env.NODE_ENV);

    console.log('Busboy:');
    bb.extend(app, {
        arrayLimit: 200,
        upload: true,
        path: process.env.ROOT + '/public/uploads',
        allowedPath: /./
    });
    console.log('   Loaded');

    console.log('Session:');
    app.use(
        session({
            secret: '1801 (Alnwick) Squadron Air Training Corps',
            store:  new memStore({checkPeriod: 86400000}),
            resave: true,
            saveUninitialized: true
        })
    );
    console.log('   Setup');

    console.log('Passport:');
    app.use(passport.initialize());
    app.use(passport.session());
    console.log('   Setup');

    console.log('Flash:');
    app.use(flash());
    app.use((req, res, next) => {
        res.locals.user    = req.user;
        res.locals.info    = req.flash('info');
        res.locals.danger  = req.flash('danger');
        res.locals.success = req.flash('success');
        next();
    });
    console.log('   Setup');

    console.log('Engine:');
    app.set('view engine', 'ejs');
    console.log('   Set');

    console.log('Public folder:');
    app.use(express.static(__dirname + '/public'));
    console.log('   Set');

    console.log('Error handling:');
    app.use((req, res, next) => {
        res.error = require(process.env.ROOT + '/fn/error');
        next();
    });
    console.log('   Set');

    console.log('Models:');
    let m           = require(process.env.ROOT + '/db/models'),
        permissions = require(process.env.ROOT + '/fn/permissions');
    console.log('   Loaded');

    console.log('Routes:');
    require('./routes/stores') (app, m, permissions.get);
    require('./routes/canteen')(app, m, permissions.get);
    require('./routes/site')   (app, m);
    console.log('   Loaded');
    
    console.log('Configuring Passport:');
    require('./config/passport.js')(passport, m);
    console.log('   Done');

    app.listen(_port, err => {
        if (err) console.log(err);
        else console.log('Server listening on port: ' + _port);
    });
})
.catch(err => console.log(err));