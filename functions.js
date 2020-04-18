const op = require('sequelize').Op,
      cn = require(process.env.ROOT + '/db/constructors'), 
      se = require("sequelize"),
      fs = require('fs'),
      ex = require('exceljs'),
      pd = require('pdfkit');
module.exports = (fn, m, inc) => {
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
            if (err.parent && err.parent.code === 'ER_DUP_ENTRY') reject(new Error(err.parent.sqlMessage));
            else reject(err);
        });
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
    fn.delete = (table, where, nullOk = false) => new Promise((resolve, reject) => {
        m[table].destroy(
            {where: where}
        )
        .then(result => {
            if (result)      resolve(true);
            else if (nullOk) resolve(false)
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
    fn.error = (err, redirect, req, res) => {
        console.log(err);
        req.flash('danger', err.message);
        res.redirect(redirect);
    };
    fn.send_error = (err, res) => {
        console.log(err);
        res.send({result: false, error: err});
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

    fn.add_qty = (stock_id, qty, table = 'stock') => new Promise((resolve, reject) => {
        m[table].findByPk(stock_id)
        .then(stock => stock.increment('_qty', {by: qty}))
        .then(stock => resolve(Number(stock._qty) + Number(qty)))
        .catch(err => reject(err));
    });
    fn.subtractStock = (stock_id, qty, table = 'stock') => new Promise((resolve, reject) => {
        m[table].findByPk(stock_id)
        .then(stock => stock.decrement('_qty', {by: qty}))
        .then(stock => resolve(Number(stock._qty) - Number(qty)))
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
};