/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('saved_reports', {
    'report_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_name': {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "null"
    },
    '_filename': {
      type: DataTypes.STRING(1000),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'saved_reports'
  });
};
