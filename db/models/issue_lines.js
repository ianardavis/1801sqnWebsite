/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('issue_lines', {
    'line_id': {
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
    'stock_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_line': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'nsn_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    '_qty': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'serial_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'return_line_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
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
    tableName: 'issue_lines'
  });
};
