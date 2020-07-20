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
    'type_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_subtype': {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "null"
    }
  }, {
    tableName: 'subtypes'
  });
};
