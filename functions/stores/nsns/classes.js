module.exports = function (m, fn) {
    fn.nsns.classes.get = function (nsn_class_id) {
        return new Promise((resolve, reject) => {
            m.nsn_classes.findOne({where: {nsn_class_id: nsn_class_id}})
            .then(nsn_class => {
                if (nsn_class) {
                    resolve(nsn_class);

                } else {
                    reject(new Error('Class not found'));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.nsns.classes.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            if (query.nsn_group_id === '') query.nsn_group_id = null;
            m.nsn_classes.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
};