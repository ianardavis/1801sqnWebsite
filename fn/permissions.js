module.exports = {
    get: function(options = {}) {
        return new Promise((resolve, reject) => {
            options.m.permissions.findAll({
                where: {user_id: options.user_id},
                attributes: ['_permission']
            })
            .then(permissions => {
                let perms = [];
                permissions.forEach(permission => perms[permission._permission] = true);
                resolve(perms);
            })
            .catch(err => reject(err));
        })
    }
};