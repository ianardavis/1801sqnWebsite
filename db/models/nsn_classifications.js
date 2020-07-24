/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nsn_classifications', {
    'nsn_classification_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'nsn_group_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_code': {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      comment: "null"
    },
    '_classification': {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "null"
    }
  }, {
    tableName: 'nsn_classifications'
  });
};
