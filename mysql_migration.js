module.exports = m => {
    let m_old     = {},
        m_canteen = require(`${process.env.ROOT}/db/canteen.mysql/models`),
        m_stores  = require(`${process.env.ROOT}/db/stores.mysql/models`),
        m_users   = require(`${process.env.ROOT}/db/users.mysql/models`);
    m_old.canteen = m_canteen.db;
    m_old.stores  = m_stores.db;
    m_old.users   = m_users.db;
    require(`${process.env.ROOT}/db/canteen.mysql/associations`)(m_old.canteen);
    require(`${process.env.ROOT}/db/stores.mysql/associations`) (m_old.stores);
    require(`${process.env.ROOT}/db/users.mysql/associations`)  (m_old);
    let col_actions = [
        m_users .queryInterface.addColumn('users',         'user_id_uuid',        { type: m_users.DataTypes.STRING }),
        m_users .queryInterface.addColumn('ranks',         'rank_id_uuid',        { type: m_users.DataTypes.STRING }),
        m_users .queryInterface.addColumn('statuses',      'status_id_uuid',      { type: m_users.DataTypes.STRING }),
        m_stores.queryInterface.addColumn('genders',       'gender_id_uuid',      { type: m_users.DataTypes.STRING }),
        m_stores.queryInterface.addColumn('nsn_countries', 'nsn_country_id_uuid', { type: m_users.DataTypes.STRING }),
        m_stores.queryInterface.addColumn('nsn_groups',    'nsn_group_id_uuid',   { type: m_users.DataTypes.STRING }),
        m_stores.queryInterface.addColumn('nsn_classes',   'nsn_class_id_uuid',   { type: m_users.DataTypes.STRING }),
        m_stores.queryInterface.addColumn('locations',     'location_id_uuid',    { type: m_users.DataTypes.STRING }),
        m_stores.queryInterface.addColumn('accounts',      'account_id_uuid',     { type: m_users.DataTypes.STRING }),
        m_stores.queryInterface.addColumn('items',         'item_id_uuid',        { type: m_users.DataTypes.STRING }),
        m_stores.queryInterface.addColumn('loancards',     'loancard_id_uuid',    { type: m_users.DataTypes.STRING })
    ];
    Promise.allSettled(col_actions)
    .then(results => {
        console.log(results);
        let base_actions = [];
        base_actions.push(
            new Promise((resolve, reject) => {
                m_old.users.ranks.findAll()
                .then(ranks => {
                    let actions = [];
                    ranks.forEach(rank => {
                        actions.push(
                            new Promise((resolve, reject) => {
                                m.ranks.create({
                                    rank: rank._rank,
                                    designator: ''
                                })
                                .then(_rank => {
                                    rank.update({rank_id_uuid: _rank.rank_id})
                                    .then(result => resolve(true))
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            })
                        );
                    });
                    return Promise.all(actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
        );
        base_actions.push(
            new Promise((resolve, reject) => {
                m_old.users.statuses.findAll()
                .then(statuses => {
                    let actions = [];
                    statuses.forEach(status => {
                        actions.push(
                            new Promise((resolve, reject) => {
                                m.statuses.create({
                                    status: status._status
                                })
                                .then(_status => {
                                    status.update({status_id_uuid: _status.status_id})
                                    .then(result => resolve(true))
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            })
                        );
                    });
                    return Promise.all(actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
        );
        base_actions.push(
            new Promise((resolve, reject) => {
                m_old.stores.genders.findAll()
                .then(genders => {
                    let actions = [];
                    genders.forEach(gender => {
                        actions.push(
                            new Promise((resolve, reject) => {
                                m.genders.create({
                                    gender: gender._gender
                                })
                                .then(_gender => {
                                    gender.update({gender_id_uuid: _gender.gender_id})
                                    .then(result => resolve(true))
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            })
                        );
                    });
                    return Promise.all(actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
        );
        base_actions.push(
            new Promise((resolve, reject) => {
                m_old.stores.nsn_countries.findAll()
                .then(countries => {
                    let actions = [];
                    countries.forEach(country => {
                        actions.push(
                            new Promise((resolve, reject) => {
                                m.nsn_countries.create({
                                    country: country._country,
                                    code:    country._code
                                })
                                .then(_country => {
                                    country.update({nsn_country_id_uuid: _country.nsn_country_id})
                                    .then(result => resolve(true))
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            })
                        );
                    });
                    return Promise.all(actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
        );
        base_actions.push(
            new Promise((resolve, reject) => {
                m_old.stores.nsn_groups.findAll()
                .then(groups => {
                    let actions = [];
                    groups.forEach(group => {
                        actions.push(
                            new Promise((resolve, reject) => {
                                m.nsn_groups.create({
                                    group: group._group,
                                    code:  group._code
                                })
                                .then(_group => {
                                    group.update({nsn_group_id_uuid: _group.nsn_group_id})
                                    .then(result => resolve(true))
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            })
                        );
                    });
                    return Promise.all(actions)
                    .then(results => {
                        new Promise((resolve, reject) => {
                            m_old.stores.nsn_classes.findAll({
                                include: [{model: m_old.stores.nsn_groups, as: 'group'}]
                            })
                            .then(classes => {
                                let actions = [];
                                classes.forEach(_class => {
                                    actions.push(
                                        new Promise((resolve, reject) => {
                                            m.nsn_classes.create({
                                                group_id: _class.group.nsn_group_id_uuid,
                                                class:    _class._classification,
                                                code:     _class._code
                                            })
                                            .then(_class_ => {
                                                _class.update({nsn_class_id_uuid: _class_.nsn_class_id})
                                                .then(result => resolve(true))
                                                .catch(err => reject(err));
                                            })
                                            .catch(err => {
                                                console.log(_class.dataValues);
                                                reject(err)
                                            });
                                        })
                                    );
                                });
                                return Promise.all(actions)
                                .then(results => resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
        );
        base_actions.push(
            new Promise((resolve, reject) => {
                m_old.stores.locations.findAll()
                .then(locations => {
                    let actions = [];
                    locations.forEach(location => {
                        actions.push(
                            new Promise((resolve, reject) => {
                                m.locations.create({
                                    location: location._location
                                })
                                .then(_location => {
                                    location.update({location_id_uuid: _location.location_id})
                                    .then(result => resolve(true))
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            })
                        );
                    });
                    return Promise.all(actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
        );
        base_actions.push(
            new Promise((resolve, reject) => {
                m_old.stores.settings.findAll()
                .then(settings => {
                    let actions = [];
                    settings.forEach(setting => {
                        actions.push(
                            new Promise((resolve, reject) => {
                                m.settings.create({
                                    name: setting._name,
                                    value: setting._value
                                })
                                .then(_location => resolve(true))
                                .catch(err => reject(err));
                            })
                        );
                    });
                    return Promise.all(actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
        );
        base_actions.push(
            new Promise((resolve, reject) => {
                m_old.canteen.settings.findAll()
                .then(settings => {
                    let actions = [];
                    settings.forEach(setting => {
                        actions.push(
                            new Promise((resolve, reject) => {
                                m.settings.create({
                                    name: setting._name,
                                    value: setting._value
                                })
                                .then(_location => resolve(true))
                                .catch(err => reject(err));
                            })
                        );
                    });
                    return Promise.all(actions)
                    .then(results => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
        );
        return Promise.all(base_actions)
        .then(results => {
            return m_old.users.users.findAll({include: [m_old.users.ranks, m_old.users.statuses]})
            .then(users => {
                let user_actions = [];
                users.forEach(user => {
                    user_actions.push(
                        new Promise((resolve, reject) => {
                            m.users.create({
                                service_number: user._bader,
                                first_name:     user._ini,
                                surname:        user._name,
                                rank_id:        user.rank.rank_id_uuid,
                                status_id:      user.status.status_id_uuid,
                                login_id:       user._login_id,
                                password:       user._password,
                                salt:           user._salt,
                                reset:         (user._reset === 1),
                                last_login:     user._last_login
                            })
                            .then(_user => {
                                user.update({user_id_uuid: _user.user_id})
                                .then(result => resolve(true))
                                .catch(err => reject(err))
                            })
                            .catch(err => reject(err));
                        })
                    );
                });
                return Promise.all(user_actions) 
                .then(results => {
                    let actions = [];
                    actions.push(
                        new Promise((resolve, reject) => {
                            m_old.stores.accounts.findAll({
                                include: [
                                    {model: m_old.stores.users, as: 'user_account'},
                                    {model: m_old.stores.users, as: 'user'}
                                ]
                            })
                            .then(accounts => {
                                let actions = [];
                                accounts.forEach(account => {
                                    actions.push(
                                        new Promise((resolve, reject) => {
                                            m.accounts.create({
                                                number: account._number,
                                                name: account._name,
                                                user_id: account.user.user_id_uuid,
                                                user_id_account: account.user_account.user_id_uuid
                                            })
                                            .then(_account => {
                                                account.update({account_id_uuid: _account.account_id})
                                                .then(result => resolve(true))
                                                .catch(err => reject(err));
                                            })
                                            .catch(err => reject(err));
                                        })
                                    );
                                });
                                return Promise.all(actions)
                                .then(results => resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    actions.push(
                        new Promise((resolve, reject) => {
                            m_old.stores.items.findAll({
                                include: [
                                    m_old.stores.genders
                                ]
                            })
                            .then(items => {
                                let actions = [];
                                items.forEach(item => {
                                    actions.push(
                                        new Promise((resolve, reject) => {
                                            m.items.create({
                                                description: item._description,
                                                gender_id: item.gender.gender_id_uuid,
                                                size_text: item._size_text
                                            })
                                            .then(_item => {
                                                item.update({item_id_uuid: _item.item_id})
                                                .then(result => resolve(true))
                                                .catch(err => reject(err));
                                            })
                                            .catch(err => reject(err));
                                        })
                                    );
                                });
                                return Promise.all(actions)
                                .then(results => resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    actions.push(
                        new Promise((resolve, reject) => {
                            m_old.stores.loancards.findAll({
                                include: [
                                    {model: m_old.stores.users, as: 'user_loancard'},
                                    {model: m_old.stores.users, as: 'user'}
                                ]
                            })
                            .then(loancards => {
                                let actions = [];
                                loancards.forEach(loancard => {
                                    actions.push(
                                        new Promise((resolve, reject) => {
                                            m.loancards.create({
                                                user_id: loancard.user.user_id_uuid,
                                                user_id_loancard: loancard.user_loancard.user_id_uuid,
                                                date_due: loancard._date_due,
                                                filename: loancard._filename || null,
                                                status: loancard._status
                                            })
                                            .then(_loancard => {
                                                loancard.update({loancard_id_uuid: _loancard.loancard_id})
                                                .then(result => resolve(true))
                                                .catch(err => reject(err));
                                            })
                                            .catch(err => reject(err));
                                        })
                                    );
                                });
                                return Promise.all(actions)
                                .then(results => resolve(true))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                    );
                    return Promise.all(user_actions) 
                    .then(results => console.log('migration done'))
                    .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log('Error getting users: ', err));
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};