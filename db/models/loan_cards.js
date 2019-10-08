/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('loan_cards', {
    'loan_card_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'cadet_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_date': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    '_closed': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'loan_cards'
  });
};
