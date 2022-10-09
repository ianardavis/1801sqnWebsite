/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gallery_images', {
    'image_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'src': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'title': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'description': {
      type: DataTypes.TEXT,
      allowNull: true,
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
    'gallery_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'gallery_images',
    schema: 'site'
  });
};
