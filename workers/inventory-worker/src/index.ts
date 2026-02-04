import amqp from 'amqplib';
async function startWorker() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'inventory_queue';
  await channel.assertQueue(queue, { durable: true, deadLetterExchange: 'dlx_exchange', deadLetterRoutingKey: 'failed_items' });
  console.log("Warehouse Worker is waiting for orders... ");
  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      try {const order = JSON.parse(msg.content.toString());
      const paymentPayload = {
        orderId: order.orderId,
        amount: order.totalAmount,
        userId: order.userId
      };
      console.log(`Checking stock for Order: ${order.orderId}`);
      console.log(`Items reserved for ${order.items.length} products.`);
      await sendToQueue('payment_queue', paymentPayload);
      channel.ack(msg);
      } catch (error) {
        console.log('Error processing order:', error);
        channel.nack(msg, false, true); 
      }
    }
  });
}
startWorker();
async function sendToQueue(queueName: string, payload: any) {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true, deadLetterExchange: 'dlx_exchange', deadLetterRoutingKey: 'failed_payments' });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true });
  await channel.close();
  await connection.close();
}
