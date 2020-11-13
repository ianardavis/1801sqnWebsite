/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sale_lines', {
    'line_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'sale_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'item_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_qty': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_new_qty': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    '_price': {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: '0.50',
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
    tableName: 'sale_lines',
    schema: 'canteen'
  });
};
