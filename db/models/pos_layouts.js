/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pos_layouts', {
    'pos_layout_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'item_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'page_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    '_column': {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "null"
    },
    '_row': {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "null"
    },
    'colour': {
      type: DataTypes.TEXT,
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
    tableName: 'pos_layouts',
    schema: 'canteen'
  });
};
