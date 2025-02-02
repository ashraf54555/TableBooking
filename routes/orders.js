const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        const {
            restaurant,
            items,
            totalAmount,
            deliveryAddress,
            specialInstructions
        } = req.body;

        const order = new Order({
            user: req.user._id,
            restaurant,
            items,
            totalAmount,
            deliveryAddress,
            specialInstructions
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('restaurant', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('restaurant');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel order
router.delete('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id,
            status: 'pending'
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found or cannot be cancelled' });
        }

        order.status = 'cancelled';
        await order.save();
        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
