/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('canteen_sessions', {
    'session_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_start': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    },
    '_end': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    '_opening_balance': {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: '0.00',
      comment: "null"
    },
    '_takings': {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "null"
    },
    '_closing_balance': {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: "null"
    },
    'opened_by': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'closed_by': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
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
    tableName: 'canteen_sessions'
  });
};