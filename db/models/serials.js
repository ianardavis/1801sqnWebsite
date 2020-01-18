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
        type: DataTypes.STRING(15),
        allowNull: false,
        comment: "null",
        unique: true
      },
      'itemsize_id': {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "null"
      },
      'issue_line_id': {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "null"
      },
      'updatedAt': {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "null"
      },
      'createdAt': {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "null"
      }
    }, {
      tableName: 'serials'
    });
  };
  