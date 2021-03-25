/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('file_details', {
    'file_detail_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'file_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'name': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'value': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.UUIDV4,
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
    }
  }, {
    tableName: 'file_details',
    schema: 'stores'
  });
};
