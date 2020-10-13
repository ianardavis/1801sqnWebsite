/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nsn_countries', {
    'nsn_country_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null"
    },
    '_code': {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      comment: "null"
    },
    '_country': {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp'),
      comment: "null"
    }
  }, {
    tableName: 'nsn_countries'
  });
};
