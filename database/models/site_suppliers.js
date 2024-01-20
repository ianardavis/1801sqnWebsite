/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('site_suppliers', {
    'site_supplier_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'site_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'supplier_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'account_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'is_stores': {
      type: DataTypes.BOOLEAN,
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
    tableName: 'site_suppliers',
    schema: 'stores'
  });
};
