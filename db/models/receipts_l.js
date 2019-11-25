/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('receipts_l', {
    'line_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null",
      primaryKey: true,
      primaryKey: true,
      autoIncrement: true
    },
    'receipt_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null",
    },
    'stock_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_qty': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'receipts_l'
  });
};
