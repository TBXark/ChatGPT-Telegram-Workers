import dotenv from 'dotenv';

dotenv.config();

const getEnvVariable = (key, defaultValue = '') => {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
};

export const ACCESS_CODE_PAYMENT_LINK = getEnvVariable('ACCESS_CODE_PAYMENT_LINK');
export const ACCESS_CODE = getEnvVariable('ACCESS_CODE');
export const TELEGRAM_API = 'https://api.telegram.org';
