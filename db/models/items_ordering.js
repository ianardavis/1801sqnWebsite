/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items_ordering', {
    'item_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null"
    },
    'supplier_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    '_demand_page': {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "null"
    },
    '_cell': {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "null"
    },
    '_details': {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'items_ordering'
  });
};
