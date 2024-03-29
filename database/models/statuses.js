/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('statuses', {
    'status_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'status': {
      type: DataTypes.TEXT,
      allowNull: false,
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
    },
    'current': {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "null"
    }
  }, {
    tableName: 'statuses',
    schema: 'users'
  });
};
