/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('item_sizes', {
    'itemsize_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'item_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'size_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'supplier_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '3',
      comment: "null"
    },
    '_ordering_details': {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: "null"
    },
    '_orderable': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    },
    '_demand_page': {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "null"
    },
    '_demand_cell': {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: "null"
    },
    'nsn_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
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
    tableName: 'item_sizes'
  });
};
