/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    'user_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'login_id': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'surname': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'first_name': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'rank_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'status_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'last_login': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'password': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'salt': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'reset': {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "null"
    },
    'full_name': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'service_number': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'users',
    schema: 'users'
  });
};
