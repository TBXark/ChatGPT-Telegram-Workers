/* eslint-disable indent */
import { sendMessageToTelegram } from './telegram';

export const needToAskForPayment = async ({ userId, db, amountOfFreeMessages }) => {
  const userData = await db.get(userId);

  if (userData) {
    const { msgCounter, paidFor } = JSON.parse(userData);

    if (paidFor) return false;
    if (msgCounter > amountOfFreeMessages) return true;
  }

  return false;
};

export const validateActivationMessage = async ({ message, activationCode, botToken, db }) => {
  if (message.text.match(/This is the activation code: ?\n?[a-z0-9]{32}$/m)) {
    const codeSent = message.text.match(/[a-z0-9]{32}/);

    if (String(codeSent) !== String(activationCode)) {
      await sendMessageToTelegram('Your code is incorrect', botToken, message.chat.id);
      return false;
    }

    const userId = message.from.id;
    const userData = await db.get(userId);

    await db.put(
      userId,
      JSON.stringify({
        ...JSON.parse(userData),
        paidFor: true,
      }),
    );

    await sendMessageToTelegram('Successfully activated', botToken, message.chat.id);

    return true;
  }
};
