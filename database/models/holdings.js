/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('holdings', {
    'holding_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'description': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'cash': {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: '0.00',
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
    tableName: 'holdings',
    schema: 'canteen'
  });
};
