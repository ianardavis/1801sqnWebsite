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
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "null"
    },
    '_name': {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "null"
    },
    '_ini': {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "null"
    },
    'full_name': {
      type: DataTypes.STRING(57),
      allowNull: true,
      comment: "null"
    },
    'rank_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'status_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    },
    '_login_id': {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "null"
    },
    '_password': {
      type: DataTypes.STRING(512),
      allowNull: false,
      comment: "null"
    },
    '_salt': {
      type: DataTypes.STRING(255),
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
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'users',
    schema: 'canteen'
  });
};
