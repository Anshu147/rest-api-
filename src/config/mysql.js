import { Sequelize } from 'sequelize';
import { config } from './env.js';

export const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.user,
  config.mysql.password,
  {
    host: config.mysql.host,
    port: config.mysql.port,
    dialect: 'mysql',
    logging: config.nodeEnv === 'development' ? (msg) => console.log(`[Sequelize] ${msg}`) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[MySQL] Connected successfully to ${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`);
  } catch (error) {
    console.error('[MySQL] Connection failed:', error.message);
    throw error;
  }
};
