/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('loan_cards_lines', {
    'line_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'loan_card_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_loan_card_line': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'item_id': {
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
    '_received_by': {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'loan_cards_lines'
  });
};
