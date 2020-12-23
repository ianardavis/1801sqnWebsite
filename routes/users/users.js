const op = require('sequelize').Op,
      { scryptSync, randomBytes } = require("crypto");
module.exports = (app, allowed, inc, permissions, m) => {
    app.post('/users/users',         permissions, allowed('user_add',      {send: true}),              (req, res) => {
        let _user = req.body.user;
        if (
            (_user._bader    && _user._bader !== '')    &&
            (_user._name     && _user._name !== '')     &&
            (_user.status_id && _user.status_id !== '') &&
            (_user._login_id && _user._login_id !== '')
        ) {
            m.users.findOne({where: {_bader: _user._bader}})
            .then(user => {
                if (user) res.send({result: false, message: 'There is already a user with this Bader/Service #'})
                else {
                    let _password = generatePassword();
                    console.log({..._user, ...{_reset: 1}, ...encryptPassword(_password.plain)});
                    m.users.create({..._user, ...{_reset: 1}, ...encryptPassword(_password.plain)})
                    .then(user => res.send({result: true, message: `User added. Password: ${_password.readable}. Password shown in UPPER CASE for readability. Password to be entered in lowercase, do not enter '-'. User must change at first login`}))
                    .catch(err => res.error.send(err, res));
                }
            })
        } else res.error.send(new Error('Not all required information has been submitted'), res)
    });
    app.put('/users/password/:id',   permissions, allowed('user_password', {send: true, allow: true}), (req, res) => {
        if (req.allowed || req.user.user_id === Number(req.params.id)) {
            if (req.body._password) {
                m.users.users.findOne({where: {user_id: req.params.id}})
                .then(user => {
                    return user.update(
                        encryptPassword(req.body._password),
                        {where: {user_id: req.params.id}}
                    )
                    .then(result => {
                        if (result) res.send({result: true, message: 'Password changed'})
                        else res.error.send(new Error('Password not changed'), res);
                    })
                    .catch(err => res.error.send(err, res));
                })
                .catch(err => res.error.send(err, res));
            } else res.error.send('No password submitted', res);
        } else res.error.send('Permission denied', res);
    });
    app.put('/users/users/:id',      permissions, allowed('user_edit',     {send: true}),              (req, res) => {
        if (req.body.user) {
            if (!req.body.user._reset) req.body.user._reset = 0;
            ['user_id','full_name','_salt','_password','createdAt','updatedAt'].forEach(e => {
                if (req.body.user[e]) delete req.body.user[e];
            });
            m.users.users.findOne({where: {user_id: req.params.id}})
            .then(user => {
                return user.update(req.body.user).then(user => res.send({result: true, message: 'User saved'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        } else res.error.send(new Error('No details submitted'), res);
    });
    
    app.delete('/users/users/:id',   permissions, allowed('user_delete',   {send: true}),              (req, res) => {
        if (Number(req.user.user_id) !== Number(req.params.id)) {
            m.users.permissions.destroy({where: {user_id: req.params.id}})
            .then(result => {
                m.users.users.destroy({where: {user_id: req.params.id}})
                .then(result => res.send({result: true, message: 'User/Permissions deleted'}))
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
    function encryptPassword (plainText) {
        let _salt     = randomBytes(16).toString("hex"),
            _password = scryptSync(plainText, _salt, 128).toString("hex");
        return {_salt: _salt, _password: _password};
    };
};