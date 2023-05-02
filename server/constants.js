import env from 'dotenv';

const {
  parsed: { ACCESS_CODE_PAYMENT_LINK, ACCESS_CODE },
} = env.config();

const telegramApi = 'https://api.telegram.org';

export default {
  telegramApi,
  accessCodePaymentLink: ACCESS_CODE_PAYMENT_LINK,
  accessCode: ACCESS_CODE,
};
