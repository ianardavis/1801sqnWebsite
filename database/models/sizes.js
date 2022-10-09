/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sizes', {
    'size_id': {
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
    'size1': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'size2': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'size3': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'orderable': {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "null"
    },
    'issueable': {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "null"
    },
    'has_serials': {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "null"
    },
    'has_nsns': {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "null"
    },
    'nsn_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'supplier_id': {
      type: DataTypes.UUIDV4,
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
    tableName: 'sizes',
    schema: 'stores'
  });
};
