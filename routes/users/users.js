const { scryptSync, randomBytes } = require("crypto");
module.exports = (app, m, inc, fn) => {
    let user_attributes = ['user_id', 'full_name', 'surname', 'first_name', 'service_number'];
    app.get('/users',             fn.loggedIn(), fn.permissions.get('access_users',    {allow: true}), (req, res) => {
        if (req.allowed) res.render('users/index')
        else res.redirect(`/users/${req.user.user_id}`);
    });
    app.get('/users/select',      fn.loggedIn(), fn.permissions.get('access_users'),                   (req, res) => res.render('users/select'));

    app.get('/users/:id',         fn.loggedIn(), fn.permissions.get('access_users',    {allow: true}), (req, res) => {
        if (req.allowed || String(req.params.id) === String(req.user.user_id)) {
            res.render('users/show')
        } else res.redirect(`/users/${req.user.user_id}`);
    });

    app.get('/get/user',          fn.loggedIn(), fn.permissions.check('access_users'),                 (req, res) => {
        m.users.findOne({
            where:      req.query,
            include:    [inc.rank(), inc.status()],
            attributes: ['user_id', 'full_name', 'service_number', 'first_name', 'surname', 'status_id', 'rank_id', 'login_id', 'reset', 'last_login']
        })
        .then(user => {
            if (!user) fn.send_error(res, 'User not found')
            else       res.send({success: true,  result: user});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/users',         fn.loggedIn(), fn.permissions.check('access_users',  {allow: true}), (req, res) => {
        if (!req.allowed) req.query.user_id = req.user.user_id;
        m.users.findAll({
            where:      req.query,
            include:    [inc.rank(), inc.status()],
            attributes: user_attributes
        })
        .then(users => res.send({success: true,  result: users}))
        .catch(err =>  fn.send_error(res, err));
    });
    app.get('/get/users_current', fn.loggedIn(), fn.permissions.check('access_users',  {allow: true}), (req, res) => {
        let where = null
        if (!req.allowed) where = {user_id: req.user.user_id};
        m.users.findAll({
            where: where,
            include:    [
                inc.rank(),
                inc.status({
                    where: {status: {[fn.op.substring]: 'Current'}},
                    required: true
                })
            ],
            attributes: user_attributes
        })
        .then(users => res.send({success: true,  result: users}))
        .catch(err =>  fn.send_error(res, err));
    });

    app.post('/users',            fn.loggedIn(), fn.permissions.check('user_add'),                     (req, res) => {
        let _user = req.body.user;
        if (
            (_user.service_number) &&
            (_user.first_name)     &&
            (_user.surname)        &&
            (_user.rank_id)        &&
            (_user.status_id)      &&
            (_user.login_id)
        ) {
            m.users.findOrCreate({
                where: {service_number: req.body.user.service_number},
                defaults: {
                    first_name: req.body.user.first_name,
                    surname:    req.body.user.surname,
                    rank_id:    req.body.user.rank_id,
                    status_id:  req.body.user.status_id,
                    login_id:   req.body.user.login_id,
                    reset:      true
                }
            })
            .then(([user, created]) => {
                if (!created) fn.send_error(res, 'There is already a user with this service #')
                else {
                    let password = generatePassword();
                    return user.update(encryptPassword(password.plain))
                    .then(user => res.send({success: true,  message: `User added. Password: ${password.readable}. Password shown in UPPER CASE for readability. Password to be entered in lowercase, do not enter '-'. User must change at first login`}))
                    .catch(err => fn.send_error(res, err));
                };
            })
        } else fn.send_error(res, 'Not all required information has been submitted');
    });
    
    app.put('/password/:id',      fn.loggedIn(), fn.permissions.check('user_edit',     {allow: true}), (req, res) => {
        if      (!req.allowed && String(req.user.user_id) !== String(req.params.id)) fn.send_error(res, 'Permission denied')
        else if (!req.body.password)                                         fn.send_error(res, 'No password submitted')
        else {
            fn.get(
                'users',
                {user_id: req.params.id}
            )
            .then(user => {
                if (user.password === encryptPassword(req.body.password, user.salt).password) fn.send_error(res, 'That is the current password!')
                else {
                    return user.update(encryptPassword(req.body.password))
                    .then(result => {
                        if (!result) fn.send_error(res, 'Password not changed')
                        else         res.send({success: true, message: 'Password changed'});
                    })
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        };
    });
    app.put('/users/:id',         fn.loggedIn(), fn.permissions.check('user_edit'),                    (req, res) => {
        if (req.body.user) {
            if (!req.body.user.reset) req.body.user.reset = 0;
            ['user_id','full_name','salt','password','createdAt','updatedAt'].forEach(e => {
                if (req.body.user[e]) delete req.body.user[e];
            });
            fn.get(
                'users',
                {user_id: req.params.id}
            )
            .then(user => {
                return user.update(req.body.user)
                .then(user => res.send({success: true,  message: 'User saved'}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        } else fn.send_error(res, 'No details submitted');
    });
    
    app.delete('/users/:id',      fn.loggedIn(), fn.permissions.check('user_delete'),                  (req, res) => {
        if (Number(req.user.user_id) === Number(req.params.id)) fn.send_error(res, 'You can not delete your own account')
        else {
            fn.get(
                'users',
                {user_id: req.params.id}
            )
            .then(user => {
                if (user.user_id === req.user.user_id) fn.send_error(res, 'You can not delete your own account')
                else {
                    let actions = [];
                    actions.push(m.permissions.destroy({where: {user_id: user.user_id}}));
                    actions.push(user.destroy());
                    return Promise.all(actions)
                    .then(result => res.send({success: true, message: 'User deleted'}))
                    .catch(err => fn.send_error(res, err));
                };
            })
        };
    });

    function generatePassword () {
        let consenants = ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z'],
            vowels     = ['a','e','i','o','u','y'],
            plain      = '',
            readable   = '';
        ['C','V','C','-','C','V','C','-','C','V','C'].forEach(l => {
            let rand = Math.random(), letter = '-';
            if (l === 'C') {
                letter = consenants[Math.floor(rand*consenants.length)];
                plain += letter;
            } else if (l === 'V'){
                letter = vowels[Math.floor(rand*vowels.length)];
                plain += letter;
            };
            readable += letter.toUpperCase();
        });
        return {plain: plain, readable: readable};
    };
    function encryptPassword (plainText, salt = null) {
        if (!salt) salt = randomBytes(16).toString("hex")
        let password = scryptSync(plainText, salt, 128).toString("hex");
        return {salt: salt, password: password};
    };
};