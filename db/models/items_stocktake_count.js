/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items_stocktake_count', {
    'stocktake_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'item_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_location': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_qty': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'items_stocktake_count'
  });
};
