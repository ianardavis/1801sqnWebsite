const ptp = require('pdf-to-printer');
const fs = require("fs");
module.exports = function (m, fn) {
    fn.settings = {
        printers: {},
        logs: {}
    };
    fn.settings.get = function (where) {
        return new Promise((resolve, reject) => {
            m.settings.findAll({where: where})
            .then(settings => {
                if (!settings || settings.length === 0) {
                    reject(new Error('Setting not found'));

                } else if (settings.length > 1) {
                    reject(new Error('Multiple settings found'));

                } else {
                    resolve(settings[0]);
                
                };
            })
            .catch(reject);
        });
    };
    fn.settings.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.settings.findAll({
                where:      where,
                attributes: ['setting_id','name', 'value'],
                ...pagination
            })
            .then(settings => resolve(settings))
            .catch(reject);
        });
    };

    fn.settings.edit = function (setting_id, details) {
        return new Promise((resolve, reject) => {
            m.settings.findOne({where: {setting_id: setting_id}})
            .then(setting => {
                if (setting) {
                    fn.update(setting, details)
                    .then(result => resolve(true))
                    .catch(reject);

                } else {
                    reject(new Error('Setting not found'));
                
                };
            })
            .catch(reject);
        });
    };
    fn.settings.set = function (name, value) {
        return new Promise((resolve, reject) => {
            m.settings.findOrCreate({
                where:    {name:  name},
                defaults: {value: value}
            })
            .then(([setting, created]) => {
                if (created) {
                    resolve(true);

                } else {
                    fn.update(setting, {value: value})
                    .then(result => resolve(true))
                    .catch(reject);

                };
            })
            .catch(reject);
        });
    };
    fn.settings.delete = function (setting_id) {
        return new Promise((resolve, reject) => {
            fn.settings.get({setting_id: setting_id})
            .then(setting => {
                setting.destroy()
                .then(result => {
                    if (result) {
                        resolve(true);

                    } else {
                        reject('Setting not deleted');

                    };
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.settings.printers.get = function () {
        return new Promise((resolve, reject) => {
            ptp.getPrinters()
            .then(printers => resolve(printers))
            .catch(reject);
        });
    };

    fn.settings.logs.get = function (type, res) {
        return new Promise((resolve, reject) => {
            fn.settings.get({name: `log ${type || ''}`})
            .then(setting => {
                let readStream = fs.createReadStream(setting.value);
                readStream.on('open',  ()  => {readStream.pipe(res)});
                readStream.on('close', ()  => {res.end()});
                readStream.on('error', err => {
                    console.log(err);
                    res.end();
                });
                resolve(true);
            })
            .catch(reject);
        });
    };

    fn.settings.run_command = function (command) {
        return new Promise((resolve, reject) => {
            try {
                const output = fn.run_cmd(command);
                console.log(output);
                resolve(true);
            } catch (err) {
                reject(err);
            };
        });
    };
};