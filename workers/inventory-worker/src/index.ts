import amqp from 'amqplib';
async function startWorker() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'inventory_queue';
  await channel.assertQueue(queue, { durable: true });
  console.log("Warehouse Worker is waiting for orders... ");
  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const order = JSON.parse(msg.content.toString());
      const paymentPayload = {
        orderId: order.orderId,
        amount: order.totalAmount,
        userId: order.userId
      };
      console.log(`Checking stock for Order: ${order.orderId}`);
      console.log(`Items reserved for ${order.items.length} products.`);
      await sendToQueue('payment_queue', paymentPayload);
      channel.ack(msg);
    }
  });
}
startWorker();
function sendToQueue(queueName: string, payload: any) {
  throw new Error('Function not implemented.');
}
