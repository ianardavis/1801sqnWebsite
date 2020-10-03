/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('canteen_sales', {
    'sale_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_complete': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    },
    '_date': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    },
    'session_id': {
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
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    }
  }, {
    tableName: 'canteen_sales'
  });
};
