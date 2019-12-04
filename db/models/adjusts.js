/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('adjusts', {
    'count_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
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
    '_qty_difference': {
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
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'adjusts'
  });
};
