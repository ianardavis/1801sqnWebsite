/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('orders', {
    'order_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'ordered_for': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'ordered_by': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_date': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    '_complete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      comment: "null",
      defaultValue: '0'
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
    tableName: 'orders'
  });
};
