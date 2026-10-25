const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const app = express();
app.use(express.json());

// Dùng cho healthcheck
app.get('/health', (req, res) => {
    const ok = mongoose.connection.readyState === 1;
    res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'db_down' });
});

// CREATE
app.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// READ all
app.get('/products', async (req, res) => {
    res.json(await Product.find());
});

// READ one
app.get('/products/:pid', async (req, res) => {
    const product = await Product.findOne({ pid: req.params.pid });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
});

// UPDATE
app.put('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { pid: req.params.pid }, req.body, { returnDocument: 'after', runValidators: true }
        );
        if (!product) return res.status(404).json({ error: 'Not found' });
        res.json(product);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DELETE
app.delete('/products/:pid', async (req, res) => {
    const product = await Product.findOneAndDelete({ pid: req.params.pid });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
});

module.exports = app;