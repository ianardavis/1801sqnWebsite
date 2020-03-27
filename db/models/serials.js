/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('serials', {
    'serial_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_serial': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null",
      unique: true
    },
    'size_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'issue_line_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '-1',
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
    tableName: 'serials'
  });
};
