var   express      = require('express'),
        app        = express(),
        passport   = require('passport'),
        session    = require('express-session'),
        bodyParser = require('body-parser'),
        env        = require('dotenv'),
        flash      = require('connect-flash'),
        m_Override = require('method-override'),
        fn         = require('./db/functions');

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
app.use(m_Override('_method'));
app.use((req, res, next) => {
    if (req.user) {
        m.permissions.findOne({
            attributes: {exclude: ['createdAt', 'updatedAt', 'user_id']},
            where: {user_id: req.user.user_id}
        }).then((permissions) => {
            res.locals.permissions = permissions;
            common_login(req, res, next)
        });
    } else {
        common_login(req, res, next)
    }
});
function common_login(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.info        = req.flash('info');
    res.locals.danger      = req.flash('danger');
    res.locals.success     = req.flash('success');
    next();
};
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var m                = require('./db/models'),
    siteRoutes       = require('./routes/site'),
    storesRoutes     = require('./routes/stores/index'),
    userRoutes       = require('./routes/stores/users')(app, m),
    itemRoutes       = require('./routes/stores/items')(app, m),
    sizeRoutes       = require('./routes/stores/item_sizes')(app, m),
    locationRoutes   = require('./routes/stores/item_locations')(app, m),
    NSNRoutes        = require('./routes/stores/item_nsns')(app, m),
    noteRoutes       = require('./routes/stores/notes')(app, m),
    supplierRoutes   = require('./routes/stores/suppliers')(app, m),
    issuesRoutes     = require('./routes/stores/issues')(app, m),
    permissionRoutes = require('./routes/stores/permissions')(app, m),
    loancardRoutes   = require('./routes/stores/loancards')(app, m),
    itemSearchRoutes = require('./routes/stores/itemSearch')(app, m);

    // Sync Database
// m.sequelize.sync({force: false}).then(() => { 
//     console.log('Database models synced') 
// }).catch((err) => {
//     console.log(err, "Something went wrong with the Database Update!") 
// });

app.use('/stores', storesRoutes);
app.use(siteRoutes);

require('./config/passport.js')(passport, m.users, m.permissions);

app.listen(1801, (err) => {
    if (!err) {
        console.log('Server listening on port 1801');
    } else {
        console.log(err);
    }
});
