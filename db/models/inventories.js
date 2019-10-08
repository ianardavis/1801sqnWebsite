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
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: "null",
      unique: true
    },
    '_squadron': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_wing': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_holder': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_holder_rank': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_parent_unit': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_default': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    },
    '_email': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'inventories'
  });
};
