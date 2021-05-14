module.exports = function(m, fn) {
    fn.allowed = function (user_id, permission, allow = false) {
        return new Promise((resolve, reject) => {
            return m.findOne({
                where: {
                    permission: permission,
                    user_id:    user_id
                },
                attributes: ['permission']
            })
            .then(permission => {
                if (!permission) {
                    if (allow) resolve(false)
                    else reject(new Error(`Permission denied: ${permission}`))
                } else resolve(true);
            })
            .catch(err => reject(err));
        });
    };
};