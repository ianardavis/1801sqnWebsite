/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('movements', {
    'movement_id': {
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
    'type': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'amount': {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: '0.00',
      comment: "null"
    },
    'holding_id_from': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'holding_id_to': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.UUIDV4,
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
    },
    'session_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'movements',
    schema: 'canteen'
  });
};
