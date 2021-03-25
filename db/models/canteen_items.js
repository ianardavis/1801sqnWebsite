/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('canteen_items', {
    'item_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'name': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'cost': {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: '0.00',
      comment: "null"
    },
    'price': {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: "null"
    },
    'qty': {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    },
    'current': {
      type: DataTypes.BOOLEAN,
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
    tableName: 'canteen_items',
    schema: 'canteen'
  });
};
