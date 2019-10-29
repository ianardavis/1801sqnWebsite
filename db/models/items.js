/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items', {
    'item_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_description': {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "null"
    },
    '_gender': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    '_category': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '19',
      comment: "null"
    },
    '_group': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    '_type': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    '_sub_type': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    '_size_text': {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: 'Size',
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
    tableName: 'items'
  });
};
