/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('loancardslines', {
    'line_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'loancard_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_line': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'stock_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_qty_issued': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_qty_returned': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    '_date': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'received_by': {
      type: DataTypes.STRING(45),
      allowNull: true,
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
    tableName: 'loancardslines'
  });
};
