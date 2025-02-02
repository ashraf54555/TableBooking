// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// API Configuration
const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-render-backend-url.onrender.com/api'
    : 'http://localhost:3000/api';

// Auth state
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Auth functions
const login = async (email, password) => {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (data.token) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            await getCurrentUser();
            showToast('Successfully logged in!');
            return true;
        }
        showToast('Invalid credentials', 'error');
        return false;
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
        return false;
    } finally {
        hideLoading();
    }
};

const register = async (userData) => {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        
        if (data.token) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            await getCurrentUser();
            showToast('Registration successful!');
            return true;
        }
        showToast('Registration failed. Please try again.', 'error');
        return false;
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
        return false;
    } finally {
        hideLoading();
    }
};

const getCurrentUser = async () => {
    try {
        if (!authToken) return null;
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        currentUser = await response.json();
        return currentUser;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
};

// Restaurant functions
const getRestaurants = async () => {
    try {
        const response = await fetch(`${API_URL}/restaurants`);
        return await response.json();
    } catch (error) {
        console.error('Get restaurants error:', error);
        return [];
    }
};

const searchRestaurants = async (query) => {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/restaurants/search/${query}`);
        const restaurants = await response.json();
        if (restaurants.length === 0) {
            showToast('No restaurants found in this area', 'error');
        }
        return restaurants;
    } catch (error) {
        console.error('Search restaurants error:', error);
        showToast('Failed to search restaurants', 'error');
        return [];
    } finally {
        hideLoading();
    }
};

const rateRestaurant = async (restaurantId, rating) => {
    try {
        if (!authToken) {
            showToast('Please login to rate restaurants', 'error');
            document.getElementById('loginModal').style.display = 'block';
            return null;
        }

        showLoading();
        const response = await fetch(`${API_URL}/restaurants/${restaurantId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ rating })
        });
        const data = await response.json();
        showToast('Thank you for rating!');
        return data;
    } catch (error) {
        console.error('Rate restaurant error:', error);
        showToast('Failed to submit rating', 'error');
        return null;
    } finally {
        hideLoading();
    }
};

const createOrder = async (orderData) => {
    try {
        if (!authToken) {
            showToast('Please login to place an order', 'error');
            document.getElementById('loginModal').style.display = 'block';
            return null;
        }

        showLoading();
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(orderData)
        });
        const data = await response.json();
        showToast('Order placed successfully!');
        return data;
    } catch (error) {
        console.error('Create order error:', error);
        showToast('Failed to place order', 'error');
        return null;
    } finally {
        hideLoading();
    }
};

const getMyOrders = async () => {
    try {
        const response = await fetch(`${API_URL}/orders/my-orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Get orders error:', error);
        return [];
    }
};

// UI Functions
const setupSearch = () => {
    const searchInput = document.querySelector('.search-box input');
    const findFoodBtn = document.querySelector('.search-box button');

    findFoodBtn.addEventListener('click', async () => {
        const location = searchInput.value.trim();
        if (location) {
            const restaurants = await searchRestaurants(location);
            updateRestaurantList(restaurants);
        } else {
            alert('Please enter a delivery address');
        }
    });
};

const updateRestaurantList = (restaurants) => {
    const restaurantGrid = document.querySelector('.restaurant-grid');
    restaurantGrid.innerHTML = '';

    restaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <img src="${restaurant.image || 'https://via.placeholder.com/300x200'}" alt="${restaurant.name}">
            <h3>${restaurant.name}</h3>
            <p>${restaurant.cuisine} • ${restaurant.rating.toFixed(1)} ★</p>
            <span class="delivery-time">${restaurant.deliveryTime.min}-${restaurant.deliveryTime.max} min</span>
            <div class="rating-container">
                <div class="stars" data-restaurant-id="${restaurant._id}">★★★★★</div>
                <span class="rating-count">(${restaurant.reviewCount} reviews)</span>
            </div>
        `;
        restaurantGrid.appendChild(card);
    });

    setupRatingSystem();
};

// Mobile menu toggle
const createMobileMenu = () => {
    const nav = document.querySelector('.nav-links');
    const burger = document.createElement('div');
    burger.className = 'burger';
    burger.innerHTML = '☰';
    burger.style.display = 'none';
    document.querySelector('nav').appendChild(burger);

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
    });

    // Add mobile menu styles dynamically
    if (window.innerWidth <= 768) {
        burger.style.display = 'block';
    }
};

// Order modal
const createOrderModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Place Your Order</h2>
            <form id="orderForm">
                <input type="text" placeholder="Name" required>
                <input type="text" placeholder="Address" required>
                <input type="tel" placeholder="Phone Number" required>
                <textarea placeholder="Special Instructions"></textarea>
                <button type="submit">Confirm Order</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Style the modal
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1001;
        }
        .modal-content {
            background: white;
            margin: 15% auto;
            padding: 20px;
            width: 80%;
            max-width: 500px;
            border-radius: 10px;
            position: relative;
        }
        .close {
            position: absolute;
            right: 20px;
            top: 10px;
            font-size: 28px;
            cursor: pointer;
        }
        #orderForm {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 20px;
        }
        #orderForm input,
        #orderForm textarea {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        #orderForm button {
            background: #ff4757;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 5px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // Modal functionality
    const orderBtns = document.querySelectorAll('.order-btn');
    const closeBtn = modal.querySelector('.close');

    orderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Form submission
    const orderForm = document.getElementById('orderForm');
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(orderForm);
        alert('Order placed successfully! We will contact you shortly.');
        modal.style.display = 'none';
        orderForm.reset();
    });
};

// Restaurant rating system
const setupRatingSystem = () => {
    const restaurants = document.querySelectorAll('.restaurant-card');
    
    restaurants.forEach(restaurant => {
        const ratingContainer = restaurant.querySelector('.rating-container');
        const stars = ratingContainer.querySelector('.stars');
        stars.addEventListener('click', async (e) => {
            const rect = stars.getBoundingClientRect();
            const width = rect.width;
            const x = e.clientX - rect.left;
            const rating = Math.ceil((x / width) * 5);
            
            stars.style.setProperty('--rating', rating);
            const restaurantId = stars.getAttribute('data-restaurant-id');
            await rateRestaurant(restaurantId, rating);
            alert(`Thank you for rating ${rating} stars!`);
        });
    });
    
    // Add rating styles
    const style = document.createElement('style');
    style.textContent = `
        .rating-container {
            padding: 10px;
        }
        .stars {
            color: #ffd700;
            font-size: 20px;
            cursor: pointer;
            --rating: 0;
            position: relative;
        }
        .stars::after {
            content: '★★★★★';
            position: absolute;
            left: 0;
            color: #ffd700;
            width: calc(var(--rating) * 20%);
            overflow: hidden;
        }
        .rating-count {
            color: #666;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
};

// Create authentication modals
const createAuthModals = () => {
    const authModalsHTML = `
        <div id="loginModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Login</h2>
                <form id="loginForm">
                    <input type="email" placeholder="Email" required>
                    <input type="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <a href="#" id="showRegister">Register</a></p>
            </div>
        </div>

        <div id="registerModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Register</h2>
                <form id="registerForm">
                    <input type="text" placeholder="Name" required>
                    <input type="email" placeholder="Email" required>
                    <input type="password" placeholder="Password" required>
                    <input type="tel" placeholder="Phone Number">
                    <input type="text" placeholder="Address">
                    <button type="submit">Register</button>
                </form>
                <p>Already have an account? <a href="#" id="showLogin">Login</a></p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', authModalsHTML);
    setupAuthModalListeners();
};

const setupAuthModalListeners = () => {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    document.getElementById('showRegister').onclick = () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    };

    document.getElementById('showLogin').onclick = () => {
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    };

    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        
        if (await login(email, password)) {
            loginModal.style.display = 'none';
            updateUIForLoggedInUser();
        } else {
            alert('Login failed. Please check your credentials.');
        }
    };

    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const userData = {
            name: registerForm.querySelector('input[type="text"]').value,
            email: registerForm.querySelector('input[type="email"]').value,
            password: registerForm.querySelector('input[type="password"]').value,
            phone: registerForm.querySelector('input[type="tel"]').value,
            address: registerForm.querySelector('input[placeholder="Address"]').value
        };

        if (await register(userData)) {
            registerModal.style.display = 'none';
            updateUIForLoggedInUser();
        } else {
            alert('Registration failed. Please try again.');
        }
    };
};

const updateUIForLoggedInUser = () => {
    const orderBtn = document.querySelector('.order-btn');
    orderBtn.textContent = currentUser ? 'My Orders' : 'Order Now';
    
    if (currentUser) {
        orderBtn.onclick = async () => {
            const orders = await getMyOrders();
            showOrdersModal(orders);
        };
    } else {
        orderBtn.onclick = () => {
            document.getElementById('loginModal').style.display = 'block';
        };
    }
};

// Loading and Notification Functions
const showLoading = () => {
    document.querySelector('.loading').classList.add('active');
};

const hideLoading = () => {
    document.querySelector('.loading').classList.remove('active');
};

const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
};

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    if (authToken) {
        await getCurrentUser();
    }

    const restaurants = await getRestaurants();
    updateRestaurantList(restaurants);
    setupSearch();
    createMobileMenu();
    createAuthModals();
    createOrderModal();
    setupRatingSystem();

    // Add scroll animation for restaurants
    const restaurantCards = document.querySelectorAll('.restaurant-card');
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    restaurantCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease-in-out';
        observer.observe(card);
    });
});
