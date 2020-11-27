module.exports = function(sequelize, DataTypes) {
  return sequelize.define('movements', {
    'movement_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    '_description': {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: "null"
    },
    '_amount': {
      type: DataTypes.DECIMAL,
      allowNull: false,
      comment: "null"
    },
    '_type': {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: "null"
    },
    'holding_id_to': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'holding_id_from': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'user_id_to': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'user_id_from': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'user_id_confirm': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_status': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1',
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
    tableName: 'movements',
    schema: 'canteen'
  });
};
