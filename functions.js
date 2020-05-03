const op = require('sequelize').Op,
      cn = require(process.env.ROOT + '/db/constructors'), 
      se = require("sequelize"),
      fs = require('fs'),
      ex = require('exceljs'),
      pd = require('pdfkit');
module.exports = (fn, m) => {
    fn.getPermissions = user_id => new Promise((resolve, reject) => {
        fn.getAllWhere(
            m.permissions,
            {user_id: user_id},
            {attributes: ['_permission']}
        )
        .then(permissions => {
            let perms = [];
            permissions.forEach(permission => perms[permission._permission] = true);
            resolve(perms);
        })
        .catch(err => reject(err));
    });
    fn.getAllWhere = (table, where, options = {}) => new Promise((resolve, reject) => {
        table.findAll({
            attributes: options.attributes || null,
            where: where,
            include: options.include || []
        })
        .then(results => {
            if (results) resolve(results);
            else if (options.nullOk) resolve(null);
            else reject(new Error('No ' + table.tableName + ' found'));
        })
        .catch(err => reject(err));
    });
    fn.getAll = (table, include = []) => new Promise((resolve, reject) => {
        table.findAll({include: include})
        .then(results => resolve(results))
        .catch(err => reject(err));
    });
    fn.getOne = (table, where, options = {}) => new Promise((resolve, reject) => {
        table.findOne({
            attributes: options.attributes || null,
            where: where,
            include: options.include || []
        })
        .then(result => {
            if (result) resolve(result);
            else if (options.nullOK) resolve(null)
            else reject(new Error(fn.singularise(table.tableName, true) + ' not found'));
        })
        .catch(err => reject(err));
    });
    fn.create = (table, record) => new Promise((resolve, reject) => {
        table.create(record)
        .then(created => resolve(created))
        .catch(err => {
            console.log(err);
            if (err.parent && err.parent.code === 'ER_DUP_ENTRY') reject(new Error(err.parent.sqlMessage));
            else reject(err);
        });
    });
    fn.createNote = note => new Promise((resolve, reject) => {
        if (note.table && note.id && note.note && note.user_id) {
            m.notes.create({
                _table:  note.table,
                _id:     note.id,
                _note:   note.note,
                user_id: note.user_id,
                _system: note.system || false
            })
            .then(new_note => resolve(new_note))
            .catch(err => reject(err));
        } else reject(err);
    });
    fn.update = (table, record, where, nullOk = false) => new Promise((resolve, reject) => {
        table.update(
            record,
            {where: where}
        )
        .then(result => {
            if (result)      resolve(true);
            else if (nullOk) resolve(false)
            else             reject(new Error(fn.singularise(table.tableName, true) + ' NOT updated',));
        })
        .catch(err => reject(err));
    });
    fn.delete = (table, where, nullOK = false) => new Promise((resolve, reject) => {
        m[table].destroy(
            {where: where}
        )
        .then(result => {
            if (result)      resolve(true);
            else if (nullOK) resolve(false)
            else             reject(new Error(fn.singularise(table.tableName, true) + ' NOT deleted',));
        })
        .catch(err => reject(err));
    });
    fn.getSetting = (options = {}) => new Promise((resolve, reject) => {
        m.settings.findOrCreate({
            where: {_name: options.setting},
            defaults: {_value: options.default || ''}
        })
        .then(([f_setting, created]) => {
            if (created) console.log('Setting created on find: ' + options.setting);
            resolve(f_setting._value);
        })
        .catch(err => {
            console.log(err);
            reject(null);
        });
    });
    fn.editSetting = (setting, value) => new Promise((resolve, reject) => {
        fn.update(
            m.settings,
            {_value: value},
            {_name: setting},
            true
        )
        .then(result => resolve(result))
        .catch(err => {
            console.log(err);
            reject(false);
        });
    });
    fn.singularise = (str, caps = false) => {
        let string = se.Utils.singularize(str);
        if (caps) string = capitalise(string)
        return string;
    };
    function capitalise (str) {
        return str.substring(0, 1).toUpperCase() + str.substring(1, str.length)
    };
    fn.addYears = (addYears = 0) => {
        var newDate = new Date();
        var dd = String(newDate.getDate()).padStart(2, '0');
        var MM = String(newDate.getMonth() + 1).padStart(2, '0');
        var yyyy = newDate.getFullYear() + addYears;
        newDate = yyyy + '-' + MM + '-' + dd;
        return newDate;
    };
    fn.error = (err, redirect, req, res) => {
        console.log(err);
        req.flash('danger', err.message);
        res.redirect(redirect);
    };
    fn.send_error = (err, res, toLog = null) => {
        let message = '';
        if (typeof(err) === 'string') message = err
        else message = err.message;
        console.log(err);
        if (toLog) console.log(toLog);
        res.send({result: false, error: message});
    };
    fn.counter = () => {
        let count = 0;
        return () => {
            return ++count;
        };
    };
    fn.timestamp = () => {
        let current = new Date(),
            year = String(current.getFullYear()),
            month = String(current.getMonth()),
            day = String(current.getDate()),
            hour = String(current.getHours()),
            minute = String(current.getMinutes()),
            second = String(current.getSeconds());
        return year + month + day + ' ' + hour + minute + second;
    };

    fn.increment = (_id, by, table = 'stock') => new Promise((resolve, reject) => {
        m[table].findByPk(_id)
        .then(stock => stock.increment('_qty', {by: by}))
        .then(stock => resolve(Number(stock._qty) + Number(by)))
        .catch(err => reject(err));
    });
    fn.decrement = (_id, by, table = 'stock') => new Promise((resolve, reject) => {
        m[table].findByPk(_id)
        .then(stock => stock.decrement('_qty', {by: by}))
        .then(stock => resolve(Number(stock._qty) - Number(by)))
        .catch(err => reject(err));
    });

    fn.downloadFile = (file, req, res) => {
        let path = process.env.ROOT + '/public/res/';
        res.download(path + file, path + file, err => {
            if (err) {
                console.log(err);
                req.flash('danger', err.message);
            };
        });
    };
    fn.promise_results = results => {
        let result = true,
            rejects = results.filter(e => e.status === 'rejected');
        if (rejects.length > 0) result = false;
        rejects.forEach(reject => console.log(reject.reason));
        return result;
    };
};