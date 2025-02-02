const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Search restaurants
router.get('/search/:query', async (req, res) => {
    try {
        const searchQuery = req.params.query;
        const restaurants = await Restaurant.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { cuisine: { $regex: searchQuery, $options: 'i' } }
            ]
        });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add rating to restaurant
router.post('/:id/rate', async (req, res) => {
    try {
        const { rating } = req.body;
        const restaurant = await Restaurant.findById(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const newRating = (restaurant.rating * restaurant.reviewCount + rating) / (restaurant.reviewCount + 1);
        restaurant.rating = newRating;
        restaurant.reviewCount += 1;

        await restaurant.save();
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get restaurant menu
router.get('/:id/menu', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.json(restaurant.menu);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
