/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items_returns', {
    'return_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'issue_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'item_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'cadet_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_qty': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_date': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'items_returns'
  });
};
