/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('details', {
    'detail_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'size_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_name': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    '_value': {
      type: DataTypes.STRING(1000),
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
    tableName: 'details',
    schema: 'stores'
  });
};
