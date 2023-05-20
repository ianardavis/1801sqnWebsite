/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('demand_line_receipts', {
    'demand_line_receipt_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'line_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'stock_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'serial_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'nsn_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'qty': {
      type: DataTypes.INTEGER,
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
    tableName: 'demand_line_receipts',
    schema: 'stores'
  });
};
