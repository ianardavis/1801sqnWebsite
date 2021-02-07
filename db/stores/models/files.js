/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('files', {
    'file_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'supplier_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_filename': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null",
      unique: true
    },
    '_description': {
      type: DataTypes.STRING(45),
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
    tableName: 'files',
    schema: 'stores'
  });
};
