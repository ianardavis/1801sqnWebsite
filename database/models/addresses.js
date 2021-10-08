/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('addresses', {
    'address_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'unit_number': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'street': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'town': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'county': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'country': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'postcode': {
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
    },
    'type': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'addresses',
    schema: 'stores'
  });
};
