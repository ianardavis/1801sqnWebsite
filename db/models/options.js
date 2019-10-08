/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('options', {
    'option_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_combo': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_option': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'options'
  });
};
