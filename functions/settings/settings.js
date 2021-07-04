module.exports = function (m, fn) {
    fn.settings = {};
    fn.settings.get = function (name) {
        return new Promise((resolve, reject) => {
            return m.settings.findAll({where: {name: name}})
            .then(settings => {
                if (!settings || settings.length === 0) reject(new Error('Setting not found'));
                else resolve(settings);
            })
            .catch(err => reject(err));
        });
    };
    fn.settings.set = function (name, value) {
        return new Promise((resolve, reject) => {
            return m.settings.findOrCreate({
                where:    {name:  name},
                defaults: {value: value}
            })
            .then(([setting, created]) => {
                if (created) resolve(true)
                else {
                    return setting.update({value: value})
                    .then(result => {
                        if (!result) reject(new Error('Setting not updated'))
                        else resolve(true);
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};