var express     = require('express'),
    app         = express(),
    passport    = require('passport'),
    session     = require('express-session'),
    bodyParser  = require('body-parser'),
    env         = require('dotenv'),
    flash       = require('connect-flash'),
    m_Override  = require('method-override'),
    fn          = require('./db/functions'),
    memoryStore = require('memorystore')(session), 
    Sequelize   = require("sequelize"),
    fileUpload  = require('express-fileupload');
function common_login(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.info        = req.flash('info');
    res.locals.danger      = req.flash('danger');
    res.locals.success     = req.flash('success');
    next();
};
process.env.ROOT = __dirname;
console.log('environment: ' + process.env.NODE_ENV);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
    secret: '1801 (Alnwick) Squadron Air Training Corps',
    store:  new memoryStore({checkPeriod: 86400000}),
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(m_Override('_method'));
app.use(fileUpload());
app.use((req, res, next) => {
    if (req.user) {
        m.permissions.findOne({
            attributes: {exclude: ['createdAt', 'updatedAt', 'user_id']},
            where: {user_id: req.user.user_id}
        }).then(permissions => {
            res.locals.permissions = permissions;
            common_login(req, res, next);
            return null;
        }).catch(err => {
            console.log(err);
            return null;
        });
    } else {
        common_login(req, res, next)
    }
});
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var m                = require('./db/models'),
    storesRoutes     = require('./routes/stores/index')(app, m),
    userRoutes       = require('./routes/stores/users')(app, m),
    itemRoutes       = require('./routes/stores/items')(app, m),
    sizeRoutes       = require('./routes/stores/item_sizes')(app, m),
    stockRoutes      = require('./routes/stores/stock')(app, m),
    NSNRoutes        = require('./routes/stores/nsns')(app, m),
    noteRoutes       = require('./routes/stores/notes')(app, m),
    supplierRoutes   = require('./routes/stores/suppliers')(app, m),
    issuesRoutes     = require('./routes/stores/issues')(app, m),
    permissionRoutes = require('./routes/stores/permissions')(app, m),
    itemSearchRoutes = require('./routes/stores/itemSearch')(app, m),
    orderRoutes      = require('./routes/stores/orders')(app, m),
    requestRoutes    = require('./routes/stores/requests')(app, m),
    adjustRoutes     = require('./routes/stores/adjusts')(app, m),
    settingRoutes    = require('./routes/stores/settings')(app, m),
    sizeRoutes       = require('./routes/stores/sizes')(app, m),
    rankRoutes       = require('./routes/stores/ranks')(app, m),
    statusRoutes     = require('./routes/stores/statuses')(app, m),
    genderRoutes     = require('./routes/stores/genders')(app, m),
    demandRoutes     = require('./routes/stores/demands')(app, m),
    requestRoutes    = require('./routes/stores/receipts')(app, m),
    siteRoutes       = require('./routes/site')(app, m);

require('./config/passport.js')(passport, m.users, m.permissions);

app.listen(1801, err => {
    if (!err) {
        console.log('Server listening on port 1801');
    } else {
        console.log(err);
    }
});
