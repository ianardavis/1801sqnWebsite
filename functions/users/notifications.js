module.exports = function (m, fn) {
    fn.notifications = {};
    fn.notifications.get_all = function (user_id) {
        return new Promise((resolve, reject) => {
            m.notifications.findAll({where: {user_id: user_id}})
            .then(notifications => resolve(notifications))
            .catch(err => reject(err));
        });
    };
};