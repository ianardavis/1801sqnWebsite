/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('giftaid', {
    'giftaid_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'user_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'startDate': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'endDate': {
      type: DataTypes.DATE,
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
    tableName: 'giftaid',
    schema: 'canteen'
  });
};
