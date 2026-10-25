const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');

const TEST_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/productdb_test';
const sample = { pid: 'P01', pname: 'Laptop', price: 1000, quantity: 5 };

before(async () => { await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 15000 }); });
beforeEach(async () => { await Product.deleteMany({}); });
after(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
});

test('GET /health', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.statusCode, 200);
});

test('POST /products tạo sản phẩm', async () => {
    const res = await request(app).post('/products').send(sample);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.pname, 'Laptop');
});

test('POST /products thiếu trường -> 400', async () => {
    const res = await request(app).post('/products').send({ pid: 'P02' });
    assert.strictEqual(res.statusCode, 400);
});

test('GET /products và GET /products/:pid', async () => {
    await Product.create(sample);
    const list = await request(app).get('/products');
    assert.strictEqual(list.body.length, 1);
    const one = await request(app).get('/products/P01');
    assert.strictEqual(one.body.pid, 'P01');
});

test('GET /products/:pid không tồn tại -> 404', async () => {
    const res = await request(app).get('/products/NOPE');
    assert.strictEqual(res.statusCode, 404);
});

test('PUT /products/:pid cập nhật', async () => {
    await Product.create(sample);
    const res = await request(app).put('/products/P01').send({ price: 1200 });
    assert.strictEqual(res.body.price, 1200);
});

test('DELETE /products/:pid xóa', async () => {
    await Product.create(sample);
    const res = await request(app).delete('/products/P01');
    assert.strictEqual(res.body.deleted, true);
    assert.strictEqual(await Product.countDocuments(), 0);
});