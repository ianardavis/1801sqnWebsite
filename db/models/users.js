/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_bader': {
      type: DataTypes.STRING(13),
      allowNull: false,
      comment: "null",
      unique: true
    },
    '_name': {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "null"
    },
    '_ini': {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: "null"
    },
    '_rank': {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: "null"
    },
    '_gender': {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "null"
    },
    '_status': {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'Current',
      comment: "null"
    },
    '_login_id': {
      type: DataTypes.STRING(256),
      allowNull: false,
      comment: "null",
      unique: true
    },
    '_password': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    '_salt': {
      type: DataTypes.STRING(256),
      allowNull: false,
      comment: "null"
    },
    '_reset': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    },
    '_last_login': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'users'
  });
};
