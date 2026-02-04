import amqp from 'amqplib';
let channel: any;
async function sendToQueue(queue: string, payload: any) {
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
}
async function startPaymentWorker() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'payment_queue';
  await channel.assertQueue(queue, { durable: true, deadLetterExchange: 'dlx_exchange', deadLetterRoutingKey: 'failed_payments' });
  console.log("Payment Worker is ready to charge cards");

  channel.consume(queue, async (msg) => {
    try {
      if (msg !== null) {
        const { orderId, amount } = JSON.parse(msg.content.toString());
        const isSuccess = Math.random() > 0.1;
        const resultPayload = {
          orderId: orderId,
          status: isSuccess ? 'SUCCESS' : 'FAILED'
        };
        await sendToQueue('order_completion_queue', resultPayload)
        await new Promise(res => setTimeout(res, 2000));
        if (isSuccess) {
          console.log(`Payment successful for Order ${orderId}`);
        } else {
          console.log(`Payment FAILED for Order ${orderId}`);
        }

        channel.ack(msg);
      }
    } catch (error) {
      console.log('Error processing payment:', error);
      if (msg !== null) {
        channel.nack(msg, false, true);
      }
    }
  });
}

startPaymentWorker();