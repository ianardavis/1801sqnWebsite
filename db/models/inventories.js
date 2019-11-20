/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('inventories', {
    'inventory_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_code': {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "null"
    },
    '_rank': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_name': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_sqn': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'inventories'
  });
};
