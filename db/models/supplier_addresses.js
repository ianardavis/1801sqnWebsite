/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('supplier_addresses', {
    'supplier_address_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'supplier_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'address_id': {
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
    tableName: 'supplier_addresses',
    schema: 'stores'
  });
};
