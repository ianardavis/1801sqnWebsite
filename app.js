var express     = require('express'),
    app         = express(),
    passport    = require('passport'),
    session     = require('express-session'),
    bodyParser  = require('body-parser'),
    flash       = require('connect-flash'),
    m_Override  = require('method-override'),
    memoryStore = require('memorystore')(session),
    fileUpload  = require('express-fileupload');
process.env.ROOT = __dirname;
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
console.log('environment: ' + process.env.NODE_ENV);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(
    session({
        secret: '1801 (Alnwick) Squadron Air Training Corps',
        store:  new memoryStore({checkPeriod: 86400000}),
        resave: true,
        saveUninitialized: true
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(m_Override('_method'));
app.use(fileUpload());
app.use((req, res, next) => {
    res.locals.user    = req.user;
    res.locals.info    = req.flash('info');
    res.locals.danger  = req.flash('danger');
    res.locals.success = req.flash('success');
    next();
});
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var m = require('./db/models');
require('./routes/stores/index')(app, m);
require('./routes/site')(app, m);
require('./config/passport.js')(passport, m);

app.listen(1801, err => {
    if (!err) {
        console.log('Server listening on port 1801');
    } else {
        console.log(err);
    };
});
