import amqp from 'amqplib';

export const sendToQueue = async (queueName: string, message: any) => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  console.log(`Sent message to ${queueName}`);
};
