import amqp from 'amqplib';
async function startWorker() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'inventory_queue';
  await channel.assertQueue(queue, { durable: true });
  console.log("Warehouse Worker is waiting for orders... ");
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      const order = JSON.parse(msg.content.toString());
      
      console.log(`Checking stock for Order: ${order.orderId}`);
      console.log(`Items reserved for ${order.items.length} products.`);
      channel.ack(msg);
      console.log("Next stop: Payment Processing...");
    }
  });
}

startWorker();