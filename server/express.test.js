const request = require('supertest');
const { app, connectDB } = require('./server');
const mongoose = require('mongoose');

let server;

beforeAll(async () => {
    // Connect to MongoDB
    await connectDB();
    // Start the server
    server = app.listen(8000);
});

afterAll(async () => {
    // Close the MongoDB connection and server
    await mongoose.connection.close();
    await server.close();
});

test('Server is listening on port 8000', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
});
