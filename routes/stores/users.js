const op = require('sequelize').Op,
      { scryptSync, randomBytes } = require("crypto");
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/users',              isLoggedIn, allowed('access_users',  {allow: true}),             (req, res) => {
        if (req.allowed) res.render('stores/users/index')
        else res.redirect('/stores/users/' + req.user.user_id);
    });
    app.get('/stores/users/new',          isLoggedIn, allowed('user_add'),                                 (req, res) => res.render('stores/users/new'));
    app.get('/stores/users/:id',          isLoggedIn, allowed('access_users',  {allow: true}),             (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            res.render('stores/users/show', {
                user_id: req.params.id,
                tab: req.query.tab || 'details'
            });
        } else res.error.redirect(new Error('Permission denied'), req, res);
    });
    app.get('/stores/users/:id/password', isLoggedIn, allowed('user_password', {allow: true}),             (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) res.render('stores/users/password', {user_id: req.params.id})
        else res.error.redirect(new Error('Permission denied'), req, res);
    });
    app.get('/stores/users/:id/edit',     isLoggedIn, allowed('user_edit'),                                (req, res) => res.render('stores/users/edit', {user_id: req.params.id}));
    
    app.post('/stores/users',             isLoggedIn, allowed('user_add',      {send: true}),              (req, res) => {
        let user = req.body.user;
        if (
            (user._bader    && user._bader !== '')    &&
            (user._name     && user._name !== '')     &&
            (user.status_id && user.status_id !== '') &&
            (user._login_id && user._login_id !== '')
        ) {
            let _password = generatePassword();
            m.users.create({...user, ...{_reset: 1}, ...encryptPassword(_password.plain)})
            .then(user => res.send({result: true, message: `User added. Password: ${_password.readable}. Password shown in UPPER CASE for readability. Password to be entered in lowercase, do not enter '-'. User must change at first login`}))
            .catch(err => res.error.send(err, res));
        } else res.error.send(new Error('Not all required information has been submitted'), res)
    });
    app.put('/stores/password/:id',       isLoggedIn, allowed('user_password', {send: true, allow: true}), (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            db.update({
                table: m.users,
                where: {user_id: req.params.id},
                record: {...req.body.user, ...encryptPassword(req.body._password)}
            })
            .then(result => res.send({result: true, message: 'Password changed'}))
            .catch(err => res.error.send(err, res));
        } else res.error.send('Permission denied', res);
    });
    app.put('/stores/users/:id',          isLoggedIn, allowed('user_edit',     {send: true}),              (req, res) => {
        if (!req.body.user)        req.body.user = {};
        if (!req.body.user._reset) req.body.user._reset = 0;
        db.update({
            table: m.users,
            where: {user_id: req.params.id},
            record: req.body.user
        })
        .then(result => res.send({result: true, message: 'User saved'}))
        .catch(err => res.error.send(err.message, res));
    });
    generatePassword = () => {
        let consenants = ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z'],
            vowels     = ['a','e','i','o','u','y'],
            plain      = '',
            readable   = '';
        ['C','V','C','-','C','V','C','-','C','V','C'].forEach(l => {
            let rand = Math.random(), letter = '-';
            if (l === 'C') {
                letter = consenants[Math.floor(rand*20)];
                plain += letter;
            } else if (l === 'V'){
                letter = vowels[Math.floor(rand*6)];
                plain += letter;
            };
            readable += letter.toUpperCase();
        });
        return {plain: plain, readable: readable};
    };
    encryptPassword = plainText => {
        let _salt     = randomBytes(16).toString("hex"),
            _password = scryptSync(plainText, _salt, 128).toString("hex");
        return {_salt: _salt, _password: _password};
    };
};
