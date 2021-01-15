module.exports = function(m, user_id, _permission) {
    return new Promise((resolve, reject) => {
        return m.findOne({
            where: {
                _permission: _permission,
                user_id:     user_id
            },
            attributes: ['_permission']
        })
        .then(permission => {
            if (!permission) reject(new Error(`Permission denied: ${_permission}`))
            else             resolve(true);
        })
        .catch(err => reject(err));
    });
};