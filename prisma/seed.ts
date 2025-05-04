import { MongoClient, ObjectId } from 'mongodb';

const mongoURI = process.env.mongo_uri || '';
if (!mongoURI) {
  throw new Error('Mongo URI is not defined in the environment variables.');
}

async function insertData() {
  const client = new MongoClient(mongoURI);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db('booking'); // Use the correct database name

    // Access the 'Order' and 'OrderStatus' collections
    const ordersCollection = db.collection('Order');
    const orderStatusCollection = db.collection('OrderStatus');

    // Clear existing data to avoid duplicates
    await ordersCollection.deleteMany({});
    await orderStatusCollection.deleteMany({});

    // Create indexes
    await ordersCollection.createIndex({ school_id: 1 }); // Index for school_id
    await ordersCollection.createIndex({ customOrderId: 1 }, { unique: true }); // Unique index for customOrderId
    await orderStatusCollection.createIndex({ collect_id: 1 }); // Index for collect_id

    // Helper function to generate random dates between 2023 and 2025
    const getRandomDate = (start: Date, end: Date) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    // Insert fresh data into the 'Order' collection
    const orders = Array.from({ length: 10 }, (_, i) => ({
      _id: new ObjectId(),
      school_id: new ObjectId(),
      trustee_id: new ObjectId(),
      customOrderId: `ORD-${1000 + i}`, // Unique customOrderId for each order
      student_info: { name: `Student ${i + 1}`, grade: `${10 + (i % 3)}`, section: String.fromCharCode(65 + (i % 3)) },
      gateway_name: i % 2 === 0 ? 'Stripe' : 'PayPal',
      createdAt: getRandomDate(new Date('2023-01-01'), new Date('2025-12-31')),
      updatedAt: new Date(),
    }));

    const orderResult = await ordersCollection.insertMany(orders);
    console.log(`Inserted ${orderResult.insertedCount} orders into the Order collection.`);

    // Insert fresh data into the 'OrderStatus' collection
    const orderStatuses = orders.flatMap((order, i) => [
      {
        collect_id: order._id, // Reference to the Order
        order_amount: 100 + i * 10,
        transaction_amount: i % 3 === 0 ? 0 : 100 + i * 10, // Failed transactions have 0 transaction amount
        payment_mode: i % 2 === 0 ? 'Credit Card' : 'Net Banking',
        payment_details: `Payment details for order ${i + 1}`,
        bank_reference: `BANK_REF_${i + 1000}`,
        payment_message: i % 3 === 0 ? 'Transaction Failed' : 'Transaction Successful',
        status: i % 3 === 0 ? 'Failed' : i % 3 === 1 ? 'Pending' : 'Success',
        error_message: i % 3 === 0 ? 'Insufficient Funds' : null,
        payment_time: getRandomDate(new Date('2023-01-01'), new Date('2025-12-31')),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        collect_id: order._id, // Reference to the Order
        order_amount: 20000 + i * 1000,
        transaction_amount: i % 2 === 0 ? 200 + i * 10 : 0, // Alternate transactions are failed
        payment_mode: i % 2 === 0 ? 'UPI' : 'Debit Card',
        payment_details: `Payment details for order ${i + 11}`,
        bank_reference: `BANK_REF_${i + 2000}`,
        payment_message: i % 2 === 0 ? 'Transaction Successful' : 'Transaction Failed',
        status: i % 2 === 0 ? 'Success' : 'Failed',
        error_message: i % 2 === 0 ? null : 'Payment Gateway Error',
        payment_time: getRandomDate(new Date('2023-01-01'), new Date('2025-12-31')),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const orderStatusResult = await orderStatusCollection.insertMany(orderStatuses);
    console.log(`Inserted ${orderStatusResult.insertedCount} order statuses into the OrderStatus collection.`);
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    // Close the connection
    await client.close();
  }
}

insertData();