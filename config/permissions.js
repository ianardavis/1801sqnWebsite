var obj = {};
var Sequelize = require("sequelize"),
env = process.env.NODE_ENV || "development",
config = require('./config.json')[env],
sequelize = new Sequelize(config.database, config.username, config.password, config),
permissions = sequelize.import('../db/models/permissions.js');

obj.all = (user_id, cb) => {
    permissions.findOne({
        attributes: {exclude: ['createdAt', 'updatedAt', 'user_id']},
        where: {
            user_id: user_id
        }
    }).then((permission) => {
        if (!permission) {
            cb(false);
        } else {
            cb(permission);
        };
    })
};

obj.allowed = (requested, user_id, cb) => {
    permissions.findOne({
        attributes: [requested],
        where: {
            user_id: user_id
        }
    }).then((permission) => {
        if (!permission) {
            cb(false);
        } else if (permission.get(requested) === 0) {
            cb(false);
        } else {
            cb(true);
        };
    })
};
module.exports = obj;