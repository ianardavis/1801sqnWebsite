/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sale_lines', {
    'sale_line_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'sale_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'item_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'qty': {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "null"
    },
    'price': {
      type: DataTypes.DOUBLE,
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
    tableName: 'sale_lines',
    schema: 'canteen'
  });
};
