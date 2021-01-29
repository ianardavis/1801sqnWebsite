/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sizes', {
    'size_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'item_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_size': {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: "null"
    },
    '_orderable': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    },
    '_issueable': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    },
    '_serials': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    },
    '_nsns': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    },
    'nsn_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'supplier_id': {
      type: DataTypes.INTEGER(11),
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
    tableName: 'sizes',
    schema: 'stores'
  });
};
