const ptp = require('pdf-to-printer');
const fs = require("fs");
module.exports = function (m, fn) {
    fn.settings = {
        printers: {},
        logs: {}
    };
    fn.settings.find = function (where) {
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
    fn.settings.findAll = function (query) {
        return new Promise((resolve, reject) => {
            m.settings.findAll({
                where:      query.where,
                attributes: ['setting_id','name', 'value'],
                ...fn.pagination(query)
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
            fn.settings.find({setting_id: setting_id})
            .then(setting => {
                setting.destroy()
                .then(result => {
                    if (result) {
                        resolve(true);

                    } else {
                        reject(new Error('Setting not deleted'));

                    };
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.settings.printers.find = function () {
        return new Promise((resolve, reject) => {
            ptp.getPrinters()
            .then(printers => resolve(printers))
            .catch(reject);
        });
    };

    fn.settings.logs.find = function (type, res) {
        return new Promise((resolve, reject) => {
            fn.settings.find({name: `log ${type || ''}`})
            .then(setting => {
                let readStream = fs.createReadStream(setting.value);
                readStream.on('open',  ()  => {readStream.pipe(res)});
                readStream.on('close', ()  => {res.end()});
                readStream.on('error', err => {
                    console.error(err);
                    res.end();
                });
                resolve(true);
            })
            .catch(reject);
        });
    };

    fn.settings.runCommand = function (command) {
        return new Promise((resolve, reject) => {
            try {
                const output = fn.runCommand(command);
                console.log(output);
                resolve(true);

            } catch (err) {
                reject(err);
                
            };
        });
    };
};