var express  = require('express'),
    app      = express(),
    passport = require('passport'),
    session  = require('express-session'),
    bb       = require('express-busboy'),
    flash    = require('connect-flash'),
    override = require('method-override'),
    memStore = require('memorystore')(session),
    upload   = require('express-fileupload');
function portInUseCheck () {
    return new Promise((resolve, reject) => {
        console.log('Port in use check:');
        const execSync = require('child_process').execSync;
        try {
            const output = execSync('ss -tnlp | grep :3000', { encoding: 'utf-8' });
            let pid = output.substring(output.indexOf('pid=') + 4, output.indexOf(',', output.search('pid=')));
            console.log('   In use by PID ' +  pid);
            try {
                const kill_output = execSync('kill -9 ' + pid, { encoding: 'utf-8' });
                console.log('   PID killed');
                resolve(true);
            } catch (error) {
                console.log(error);
                reject(true);
            };
        } catch (error) {
            if (error.output[0]) {
                reject(error);
            } else {
                console.log('   Not in use');
                resolve(false);
            };
        };
    });
};
portInUseCheck()
.then(result => {
    process.env.ROOT = __dirname;
    if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
    console.log('environment: ' + process.env.NODE_ENV);
    app.use(
        session({
            secret: '1801 (Alnwick) Squadron Air Training Corps',
            store:  new memStore({checkPeriod: 86400000}),
            resave: true,
            saveUninitialized: true
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(override('_method'));
    app.use(upload());
    app.use((req, res, next) => {
        res.locals.user    = req.user;
        res.locals.info    = req.flash('info');
        res.locals.danger  = req.flash('danger');
        res.locals.success = req.flash('success');
        next();
    });
    app.set('view engine', 'ejs');
    bb.extend(app);
    app.use(express.static(__dirname + '/public'));

    let m = require('./db/models');
    require('./routes/stores')(app, m);
    require('./routes/canteen')(app, m);
    require('./routes/site')(app, m);
    require('./config/passport.js')(passport, m);

    app.listen(3000, err => {
        if (err) console.log(err);
        else console.log('Server listening on port 1801');
    });
})
.catch(err => {
    console.log(err);
});