/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('item_attributes', {
    'attribute_id': {
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
    tableName: 'item_attributes',
    schema: 'core'
  });
};