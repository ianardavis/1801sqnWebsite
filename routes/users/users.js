const op = require('sequelize').Op,
      { scryptSync, randomBytes } = require("crypto");
module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/users/get/users',    permissions, allowed('access_users',  {send: true}),              (req, res) => {
        m.users.findAll({
            where:      req.query,
            include:    [inc.ranks(), inc.statuses()],
            attributes: ['user_id', 'full_name', '_bader', '_name', '_ini', 'status_id', 'rank_id', '_login_id', '_reset', '_last_login']
        })
        .then(users => res.send({success: true, users: users}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/users/get/user',     permissions, allowed('access_users',  {send: true}),              (req, res) => {
        m.users.findOne({
            where:      req.query,
            include:    [inc.ranks(), inc.statuses()],
            attributes: ['user_id', 'full_name', '_bader', '_name', '_ini', 'status_id', 'rank_id', '_login_id', '_reset', '_last_login']
        })
        .then(user => {
            if (user) res.send({success: true,  user: user})
            else      res.send({success: false, message: 'User not found'});
        })
        .catch(err => res.error.send(err, res));
    });

    app.post('/users/users',       permissions, allowed('user_add',      {send: true}),              (req, res) => {
        let _user = req.body.user;
        if (
            (_user._bader    && _user._bader !== '')    &&
            (_user._name     && _user._name !== '')     &&
            (_user.status_id && _user.status_id !== '') &&
            (_user._login_id && _user._login_id !== '')
        ) {
            m.users.findOne({where: {_bader: _user._bader}})
            .then(user => {
                if (user) res.send({success: false, message: 'There is already a user with this Bader/Service #'})
                else {
                    let _password = generatePassword();
                    m.users.create({..._user, ...{_reset: 1}, ...encryptPassword(_password.plain)})
                    .then(user => res.send({success: true, message: `User added. Password: ${_password.readable}. Password shown in UPPER CASE for readability. Password to be entered in lowercase, do not enter '-'. User must change at first login`}))
                    .catch(err => res.error.send(err, res));
                }
            })
        } else res.error.send(new Error('Not all required information has been submitted'), res)
    });
    
    app.put('/users/password/:id', permissions, allowed('user_password', {send: true, allow: true}), (req, res) => {
        if      (!req.allowed && req.user.user_id !== Number(req.params.id)) res.send({success: false, message: 'Permission denied'})
        else if (!req.body._password)                                        res.send({success: false, message: 'No password submitted'})
        else {
            m.users.findOne({
                where: {user_id: req.params.id},
                attributes: ['user_id', '_password', '_salt']
            })
            .then(user => {
                if      (!user)                                                                        res.send({success: false, message: 'User not found'})
                else if (user._password === encryptPassword(req.body._password, user._salt)._password) res.send({success: false, message: 'That is the current password!'})
                else {
                    return user.update(encryptPassword(req.body._password))
                    .then(result => {
                        if (result) res.send({success: true,  message: 'Password changed'})
                        else        res.send({success: false, message: 'Password not changed'});
                    })
                    .catch(err => res.error.send(err, res));
                };
            })
            .catch(err => res.error.send(err, res));
        };
    });
    app.put('/users/users/:id',    permissions, allowed('user_edit',     {send: true}),              (req, res) => {
        if (req.body.user) {
            if (!req.body.user._reset) req.body.user._reset = 0;
            ['user_id','full_name','_salt','_password','createdAt','updatedAt'].forEach(e => {
                if (req.body.user[e]) delete req.body.user[e];
            });
            m.users.findOne({where: {user_id: req.params.id}})
            .then(user => {
                return user.update(req.body.user).then(user => res.send({success: true, message: 'User saved'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        } else res.error.send(new Error('No details submitted'), res);
    });
    
    app.delete('/users/users/:id', permissions, allowed('user_delete',   {send: true}),              (req, res) => {
        if (Number(req.user.user_id) !== Number(req.params.id)) {
            m.users.permissions.destroy({where: {user_id: req.params.id}})
            .then(result => {
                m.users.destroy({where: {user_id: req.params.id}})
                .then(result => res.send({success: true, message: 'User/Permissions deleted'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        } else res.send_error('You can not delete your own account', res);       
    });

    function generatePassword () {
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
    function encryptPassword (plainText, _salt = null) {
        if (!_salt) _salt = randomBytes(16).toString("hex")
        let _password = scryptSync(plainText, _salt, 128).toString("hex");
        return {_salt: _salt, _password: _password};
    };
};