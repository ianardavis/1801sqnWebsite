/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('eans', {
    'item_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'item_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'ean': {
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
    }
  }, {
    tableName: 'eans',
    schema: 'canteen'
  });
};