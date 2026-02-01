import amqp from 'amqplib';
async function startPaymentWorker() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'payment_queue';
  await channel.assertQueue(queue, { durable: true });
  console.log("Payment Worker is ready to charge cards");

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const { orderId, amount } = JSON.parse(msg.content.toString());
      console.log(`Processing payment for Order ${orderId} of $${amount}...`);
      await new Promise(res => setTimeout(res, 2000));
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        console.log(`Payment successful for Order ${orderId}`);
      } else {
        console.log(`Payment FAILED for Order ${orderId}`);
      }

      channel.ack(msg);
    }
  });
}

startPaymentWorker();