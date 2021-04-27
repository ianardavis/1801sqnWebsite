module.exports = function(m, fn) {
    fn.allowed = function (user_id, permission) {
        return new Promise((resolve, reject) => {
            return m.findOne({
                where: {
                    permission: permission,
                    user_id:    user_id
                },
                attributes: ['permission']
            })
            .then(permission => {
                if (!permission) reject(new Error(`Permission denied: ${permission}`))
                else             resolve(true);
            })
            .catch(err => reject(err));
        });
    };
};