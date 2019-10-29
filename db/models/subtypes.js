/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subtypes', {
    'subtype_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_parent': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_sub_type': {
      type: DataTypes.STRING(45),
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
    tableName: 'subtypes'
  });
};
