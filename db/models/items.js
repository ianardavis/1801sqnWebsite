/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items', {
    'item_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_description': {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "null"
    },
    '_size': {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "null"
    },
    '_gender': {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "null"
    },
    '_category': {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "null"
    },
    '_type': {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "null"
    },
    '_sub_type': {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'items'
  });
};
