/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('request_lines', {
    'line_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'request_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'size_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_qty': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_status': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    },
    '_action': {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "null"
    },
    '_date': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    '_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'approved_by': {
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
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'request_lines',
    schema: 'stores'
  });
};