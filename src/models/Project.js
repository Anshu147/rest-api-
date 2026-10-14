import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

export const PROJECT_STATUSES = ['active', 'completed', 'archived'];

export const Project = sequelize.define(
  'Project',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Project title is required' },
        len: { args: [2, 150], msg: 'Title must be between 2 and 150 characters' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(...PROJECT_STATUSES),
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [PROJECT_STATUSES],
          msg: `Status must be one of: ${PROJECT_STATUSES.join(', ')}`
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  },
  {
    tableName: 'projects',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      }
    ]
  }
);
