/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('adjusts', {
    'adjust_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'size_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'stock_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_type': {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "null"
    },
    '_qty': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_variance': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
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
    tableName: 'adjusts',
    schema: 'stores'
  });
};
