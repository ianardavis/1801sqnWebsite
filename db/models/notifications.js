/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notifications', {
    'notification_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_title': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_notification': {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "null"
    },
    '_urgency': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    },
    '_active': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    },
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    }
  }, {
    tableName: 'notifications'
  });
};
