/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('stock', {
    'stock_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'size_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'location_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_qty': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
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
    tableName: 'stock',
    schema: 'stores'
  });
};
