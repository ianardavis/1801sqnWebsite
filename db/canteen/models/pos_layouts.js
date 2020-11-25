/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pos_layouts', {
    'pos_layout_id': {
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
    'page_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_column': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    '_row': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    '_colour': {
      type: DataTypes.STRING(10),
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
    tableName: 'pos_layouts',
    schema: 'canteen'
  });
};
