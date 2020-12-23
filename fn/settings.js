module.exports = {
    get: function(options = {}) {
        return new Promise((resolve, reject) => {
            settings.findOrCreate({
                where: {_name: options.name},
                defaults: {_value: options.default || ''}
            })
            .then(([f_setting, created]) => {
                if (created) console.log(`Setting created on find: ${options.name}`);
                resolve(f_setting._value);
            })
            .catch(err => {
                console.log(err);
                reject(null);
            });
        })
    },
    edit: function(options = {}) {
        return new Promise((resolve, reject) => {
            settings.update(
                {_value: options.value},
                {where: {_name: options.name}}
            )
            .then(result => resolve(result))
            .catch(err => {
                console.log(err);
                reject(false);
            });
        })
    }
};