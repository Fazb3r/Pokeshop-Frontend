import apiService from '../services/api.js';

// Function to check if user is logged in
const checkAuth = () => {
    const token = localStorage.getItem('pokeShopToken');
    if (!token) {
        // Redirect to login if no token is found
        window.location.href = 'login.html';
        return false;
    }
    return true;
};

// Function to display user information
const displayUserInfo = () => {
    const userInfo = JSON.parse(localStorage.getItem('pokeShopUser'));
    
    if (userInfo) {
        const userInfoElement = document.querySelector('.user-information');
        userInfoElement.innerHTML = `
            <p>Username: ${userInfo.username}</p>
            <p>User Type: ${userInfo.userType}</p>
        `;
    }
};

// Function to create Pokemon card HTML
const createPokemonCard = (pokemon) => {
    return `
        <div class="pokemon-card" data-id="${pokemon.id}">
            <img src="${pokemon.image_url || './assets/img/pokemon-placeholder.png'}" alt="${pokemon.name}" class="pokemon-image">
            <h3>${pokemon.name}</h3>
            <p class="pokemon-type">Type: ${pokemon.type}</p>
            <p class="pokemon-price">$${!isNaN(pokemon.price) ? Number(pokemon.price).toFixed(2) : "0.00"}</p>
            <p class="pokemon-stock">Stock: ${pokemon.stock}</p>
            <p class="pokemon-description">${pokemon.description || 'No description available'}</p>
            <button class="add-to-cart-btn" data-id="${pokemon.id}">Add to Cart</button>
        </div>
    `;
};

// Function to load Pokemon products
const loadPokemonProducts = async () => {
    try {
        const shopContainer = document.querySelector('.shop-container');
        shopContainer.innerHTML = '<div class="loading">Loading products...</div>'; // Loading indicator
        
        const pokemonList = await apiService.pokemon.getAll();
        
        shopContainer.innerHTML = ''; // Clear loading indicator
        
        if (pokemonList.length === 0) {
            shopContainer.innerHTML = '<p class="no-products">No Pokemon available at the moment.</p>';
            return;
        }
        
        // Create HTML for each Pokemon
        pokemonList.forEach(pokemon => {
            shopContainer.innerHTML += createPokemonCard(pokemon);
        });
        
        // Add event listeners to add-to-cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });

        // Check if user is admin and add admin functionality
        const userInfo = JSON.parse(localStorage.getItem('pokeShopUser'));
        if (userInfo && userInfo.userType === 'administrator') {
            enableAdminFeatures();
        }
    } catch (error) {
        console.error('Error loading Pokemon products:', error);
        const shopContainer = document.querySelector('.shop-container');
        shopContainer.innerHTML = '<p class="no-products">Failed to load products. Please try again later.</p>';
    }
};

// Function to handle adding a Pokemon to cart
const handleAddToCart = async (event) => {
    const pokemonId = event.target.getAttribute('data-id');
    
    try {
        // Disable button while processing
        event.target.disabled = true;
        event.target.textContent = 'Adding...';
        
        await apiService.cart.addItem(pokemonId, 1);
        
        event.target.textContent = 'Added!';
        setTimeout(() => {
            event.target.disabled = false;
            event.target.textContent = 'Add to Cart';
        }, 1500);
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert(`Failed to add to cart: ${error.message}`);
        event.target.disabled = false;
        event.target.textContent = 'Add to Cart';
    }
};

// Function to handle navigation button clicks
const setupNavigation = () => {
    const buttons = document.querySelectorAll('.button-container button');
    
    // Products button
    buttons[0].addEventListener('click', () => {
        loadPokemonProducts();
    });
    
    // Logout button
    buttons[1].addEventListener('click', () => {
        localStorage.removeItem('pokeShopToken');
        localStorage.removeItem('pokeShopUser');
        window.location.href = 'login.html';
    });
};

// Set up cart icon click handler
const setupCartIcon = () => {
    const cartIcon = document.querySelector('.shop-icon img');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            if (typeof window.showCartModal === 'function') {
                window.showCartModal();
            } else {
                console.error('showCartModal function not found');
            }
        });
    } else {
        console.error('Cart icon not found');
    }
};

// Make sure these functions exist in the global scope for HTML onclick attributes
window.showCartModal = function() {
    if (typeof window.renderCartPanel === 'function') {
        window.renderCartPanel();
    } else {
        console.error('renderCartPanel function not found');
    }
};

window.showPurchaseHistory = function() {
    if (typeof window.renderPurchaseHistoryPanel === 'function') {
        window.renderPurchaseHistoryPanel();
    } else {
        console.error('renderPurchaseHistoryPanel function not found');
    }
};

const enableAdminFeatures = () => {
    // 1. Botón "Add New Pokemon"
    const adminControls = document.getElementById('admin-controls');
    const addNewButton = document.createElement('button');
    addNewButton.textContent = 'Add New Pokemon';
    addNewButton.classList.add('admin-add-button');
    addNewButton.addEventListener('click', showAddPokemonForm);
    adminControls.appendChild(addNewButton);

    // 2. Esperar a que existan las tarjetas
    const cards = document.querySelectorAll('.pokemon-card');
    if (cards.length === 0) return; // no hay tarjetas aún

    // 3. Añadir botones a cada tarjeta
    cards.forEach(card => {
        const adminActions = document.createElement('div');
        adminActions.classList.add('admin-actions');

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('admin-edit-btn');
        editBtn.dataset.id = card.dataset.id;
        editBtn.addEventListener('click', () => handleEditPokemon(card.dataset.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('admin-delete-btn');
        deleteBtn.dataset.id = card.dataset.id;
        deleteBtn.addEventListener('click', () => handleDeletePokemon(card.dataset.id));

        adminActions.appendChild(editBtn);
        adminActions.appendChild(deleteBtn);
        card.appendChild(adminActions);
    });
};

// Function to show add Pokemon form
const showAddPokemonForm = () => {
    // Create a modal form
    const formHTML = `
        <div class="pokemon-form-content">
            <h2>Add New Pokemon</h2>
            <form id="add-pokemon-form">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" required>
                </div>
                <div class="form-group">
                    <label for="type">Type:</label>
                    <input type="text" id="type" required>
                </div>
                <div class="form-group">
                    <label for="price">Price:</label>
                    <input type="number" id="price" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="stock">Stock:</label>
                    <input type="number" id="stock" min="0" required>
                </div>
                <div class="form-group">
                    <label for="image_url">Image URL:</label>
                    <input type="text" id="image_url">
                </div>
                <div class="form-group">
                    <label for="description">Description:</label>
                    <textarea id="description" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" id="cancel-pokemon">Cancel</button>
                    <button type="submit">Save Pokemon</button>
                </div>
            </form>
        </div>
    `;
    
    // Add form to body
    const formContainer = document.createElement('div');
    formContainer.classList.add('pokemon-form-modal');
    formContainer.innerHTML = formHTML;
    document.body.appendChild(formContainer);
    
    // Add event listeners
    document.getElementById('cancel-pokemon').addEventListener('click', () => {
        document.body.removeChild(formContainer);
    });
    
    document.getElementById('add-pokemon-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const saveButton = e.target.querySelector('button[type="submit"]');
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
        
        const newPokemon = {
            name: document.getElementById('name').value,
            type: document.getElementById('type').value,
            price: parseFloat(document.getElementById('price').value),
            stock: parseInt(document.getElementById('stock').value),
            image_url: document.getElementById('image_url').value,
            description: document.getElementById('description').value
        };
        
        try {
            await apiService.pokemon.create(newPokemon);
            alert('Pokemon added successfully!');
            document.body.removeChild(formContainer);
            loadPokemonProducts(); // Refresh the product list
        } catch (error) {
            alert(`Error adding Pokemon: ${error.message}`);
            saveButton.disabled = false;
            saveButton.textContent = 'Save Pokemon';
        }
    });
};

// Function to handle editing Pokemon
const handleEditPokemon = async (pokemonId) => {
    try {
        // Get the Pokemon data
        const pokemon = await apiService.pokemon.getById(pokemonId);
        
        // Create modal form with pre-filled data
        const formHTML = `
            <div class="pokemon-form-content">
                <h2>Edit Pokemon</h2>
                <form id="edit-pokemon-form">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" value="${pokemon.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="type">Type:</label>
                        <input type="text" id="type" value="${pokemon.type}" required>
                    </div>
                    <div class="form-group">
                        <label for="price">Price:</label>
                        <input type="number" id="price" step="0.01" min="0" value="${pokemon.price}" required>
                    </div>
                    <div class="form-group">
                        <label for="stock">Stock:</label>
                        <input type="number" id="stock" min="0" value="${pokemon.stock}" required>
                    </div>
                    <div class="form-group">
                        <label for="image_url">Image URL:</label>
                        <input type="text" id="image_url" value="${pokemon.image_url || ''}">
                    </div>
                    <div class="form-group">
                        <label for="description">Description:</label>
                        <textarea id="description" rows="3">${pokemon.description || ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" id="cancel-pokemon-edit">Cancel</button>
                        <button type="submit">Update Pokemon</button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form to body
        const formContainer = document.createElement('div');
        formContainer.classList.add('pokemon-form-modal');
        formContainer.innerHTML = formHTML;
        document.body.appendChild(formContainer);
        
        // Add event listeners
        document.getElementById('cancel-pokemon-edit').addEventListener('click', () => {
            document.body.removeChild(formContainer);
        });
        
        document.getElementById('edit-pokemon-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updateButton = e.target.querySelector('button[type="submit"]');
            updateButton.disabled = true;
            updateButton.textContent = 'Updating...';
            
            const updatedPokemon = {
                name: document.getElementById('name').value,
                type: document.getElementById('type').value,
                price: parseFloat(document.getElementById('price').value),
                stock: parseInt(document.getElementById('stock').value),
                image_url: document.getElementById('image_url').value,
                description: document.getElementById('description').value
            };
            
            try {
                await apiService.pokemon.update(pokemonId, updatedPokemon);
                alert('Pokemon updated successfully!');
                document.body.removeChild(formContainer);
                loadPokemonProducts(); // Refresh the product list
            } catch (error) {
                alert(`Error updating Pokemon: ${error.message}`);
                updateButton.disabled = false;
                updateButton.textContent = 'Update Pokemon';
            }
        });
    } catch (error) {
        console.error('Error getting Pokemon details:', error);
        alert(`Failed to get Pokemon details: ${error.message}`);
    }
};

// Function to handle deleting Pokemon
const handleDeletePokemon = async (pokemonId) => {
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this Pokemon?')) {
        return;
    }
    
    try {
        await apiService.pokemon.delete(pokemonId);
        alert('Pokemon deleted successfully!');
        loadPokemonProducts(); // Refresh the product list
    } catch (error) {
        console.error('Error deleting Pokemon:', error);
        alert(`Failed to delete Pokemon: ${error.message}`);
    }
};

// Initialize functions when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    if (!checkAuth()) return;
    
    // Display user information
    displayUserInfo();
    
    // Load Pokemon products
    loadPokemonProducts();
    
    // Set up navigation
    setupNavigation();
    
    // Set up cart icon
    setupCartIcon();
});