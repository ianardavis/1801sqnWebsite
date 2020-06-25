module.exports = {
    get: (options = {}) => new Promise((resolve, reject) => {
        options.m.settings.findOrCreate({
            where: {_name: options.name},
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
    }),
    edit: (options = {}) => new Promise((resolve, reject) => {
        options.m.settings.update(
            {_value: options.value},
            {where: {_name: options.name}}
        )
        .then(result => resolve(result))
        .catch(err => {
            console.log(err);
            reject(false);
        });
    })
};