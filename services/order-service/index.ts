import express from 'express';
import { Pool } from 'pg';
import { sendToQueue } from "../../shared/queue.js"
import amqp from 'amqplib';
const app = express();
app.use(express.json());
const pool = new Pool({
  connectionString: "postgres://user:password123@localhost:5432/ecommerce"
});
async function listenForCompletion() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'order_completion_queue';

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const { orderId, status } = JSON.parse(msg.content.toString());
      
      const finalStatus = status === 'SUCCESS' ? 'COMPLETED' : 'CANCELLED';
      await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2',
        [finalStatus, orderId]
      );

      console.log(`Order ${orderId} has been updated to: ${finalStatus}`);
      channel.ack(msg);
    }
  });
}

listenForCompletion();
app.post('/orders', async (req, res) => {
  const { userId, items, total, idempotencyKey } = req.body;
  try {
    const existingOrder = await pool.query(
      'SELECT * FROM orders WHERE idempotency_key = $1', [idempotencyKey]
    );

    if (existingOrder.rows.length > 0) {
      return res.json(existingOrder.rows[0]);
    }
    const newOrder = await pool.query(
      'INSERT INTO orders (user_id, total, status, idempotency_key) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, total, 'PENDING', idempotencyKey]
    );
    console.log("Order saved to DB. Now we need to check inventory...");
    res.status(201).json(newOrder.rows[0]);
    const orderPayload = {
      orderId: newOrder.rows[0].id,
      items: items,
      userId: userId
    };
    await sendToQueue('inventory_queue', orderPayload);
    console.log("Message sent to Inventory Worker");
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});