var   express         = require('express'),
        app             = express(),
        passport        = require('passport'),
        session         = require('express-session'),
        bodyParser      = require('body-parser'),
        env             = require('dotenv'),
        flash           = require('connect-flash'),
        methodOverride  = require('method-override');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
    secret: '1801 (Alnwick) Squadron Air Training Corps',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(methodOverride('_method'));
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.info = req.flash('info');
    res.locals.danger = req.flash('danger');
    res.locals.success = req.flash('success');
    next();
})
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var m               = require('./db/models'),
    siteRoutes      = require('./routes/site'),
    storesRoutes    = require('./routes/stores/index'),
    userRoutes      = require('./routes/stores/users')(app, m.users, m.notes, m.options, m.permissions);
// Sync Database

m.sequelize.sync({force: false}).then(() => { 
    console.log('Database models synced') 
}).catch((err) => { 
    console.log(err, "Something went wrong with the Database Update!") 
});

app.use('/stores', storesRoutes);
app.use(siteRoutes);

require('./config/passport.js')(passport, m.users, m.permissions);

app.listen(1801, (err) => {
    if (!err) {
        console.log('Server listening');
    } else {
        console.log(err);
    }
})