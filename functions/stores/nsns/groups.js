module.exports = function (m, fn) {
    fn.nsns.groups.get = function (nsn_group_id) {
        return new Promise((resolve, reject) => {
            m.nsn_groups.findOne({where: {nsn_group_id: nsn_group_id}})
            .then(nsn_class => {
                if (nsn_class) {
                    resolve(nsn_class);

                } else {
                    reject(new Error('Group not found'));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.nsns.groups.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.nsn_groups.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
};