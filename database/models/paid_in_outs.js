/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('paid_in_outs', {
    'paid_in_out_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'reason': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'user_id_paid_in_out': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'amount': {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: '0.00',
      comment: "null"
    },
    'holding_id': {
      type: DataTypes.UUIDV4,
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
    },
    'status': {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '1',
      comment: "null"
    },
    'paid_in': {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "null"
    }
  }, {
    tableName: 'paid_in_outs',
    schema: 'canteen'
  });
};
