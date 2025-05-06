// POKESHOP_FRONT/src/scripts/index.js
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
            <p class="pokemon-price">$${pokemon.price.toFixed(2)}</p>
            <p class="pokemon-stock">Stock: ${pokemon.stock}</p>
            <p class="pokemon-description">${pokemon.description || 'No description available'}</p>
            <button class="add-to-cart-btn" data-id="${pokemon.id}">Add to Cart</button>
        </div>
    `;
};

// Function to load Pokemon products
const loadPokemonProducts = async () => {
    try {
        const pokemonList = await apiService.pokemon.getAll();
        
        const shopContainer = document.querySelector('.shop-container');
        shopContainer.innerHTML = ''; // Clear placeholders
        
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
    } catch (error) {
        console.error('Error loading Pokemon products:', error);
        alert('Failed to load products. Please try again later.');
    }
};

// Function to handle adding a Pokemon to cart
const handleAddToCart = async (event) => {
    const pokemonId = event.target.getAttribute('data-id');
    
    try {
        await apiService.cart.addItem(pokemonId, 1);
        alert('Pokemon added to cart!');
        // Optionally update cart icon or counter here
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert(`Failed to add to cart: ${error.message}`);
    }
};

// Function to handle navigation button clicks
const setupNavigation = () => {
    const buttons = document.querySelectorAll('.button-container button');
    
    // Products button
    buttons[0].addEventListener('click', () => {
        loadPokemonProducts();
    });
    
    // Purchase history button (if implemented)
    buttons[1].addEventListener('click', () => {
        alert('Purchase history feature coming soon!');
    });
    
    // Logout button
    buttons[2].addEventListener('click', () => {
        localStorage.removeItem('pokeShopToken');
        localStorage.removeItem('pokeShopUser');
        window.location.href = 'login.html';
    });
};

// Function to set up shopping cart icon click
const setupCartIcon = () => {
    const cartIcon = document.querySelector('.shop-icon img');
    cartIcon.addEventListener('click', async () => {
        try {
            const cart = await apiService.cart.get();
            
            // Display cart in a modal or redirect to cart page
            if (cart.items.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            // For now, just show a simple alert with cart info
            let cartSummary = `Cart Total: $${cart.total.toFixed(2)}\n\nItems:\n`;
            cart.items.forEach(item => {
                cartSummary += `- ${item.name} (${item.quantity}) $${(item.price_at_time * item.quantity).toFixed(2)}\n`;
            });
            
            alert(cartSummary);
            
            // In a real implementation, you might open a modal with the cart
            // or redirect to a dedicated cart page
        } catch (error) {
            console.error('Error fetching cart:', error);
            alert(`Failed to load cart: ${error.message}`);
        }
    });
};

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    if (!checkAuth()) return;
    
    // Display user information
    displayUserInfo();
    
    // Set up navigation
    setupNavigation();
    
    // Set up cart icon
    setupCartIcon();
    
    // Load Pokemon products
    await loadPokemonProducts();
    
    // Check if user is admin and add admin functionality if needed
    const userInfo = JSON.parse(localStorage.getItem('pokeShopUser'));
    if (userInfo && userInfo.userType === 'administrator') {
        enableAdminFeatures();
    }
});

// Function to enable admin features
const enableAdminFeatures = () => {
    const shopContainer = document.querySelector('.shop-container');
    
    // Add "Add New Pokemon" button at the top
    const addNewButton = document.createElement('button');
    addNewButton.textContent = 'Add New Pokemon';
    addNewButton.classList.add('admin-add-button');
    addNewButton.addEventListener('click', showAddPokemonForm);
    
    shopContainer.parentNode.insertBefore(addNewButton, shopContainer);
    
    // Add edit/delete buttons to each Pokemon card
    document.querySelectorAll('.pokemon-card').forEach(card => {
        const adminActions = document.createElement('div');
        adminActions.classList.add('admin-actions');
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('admin-edit-btn');
        editBtn.dataset.id = card.dataset.id;
        editBtn.addEventListener('click', (e) => handleEditPokemon(e.target.dataset.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('admin-delete-btn');
        deleteBtn.dataset.id = card.dataset.id;
        deleteBtn.addEventListener('click', (e) => handleDeletePokemon(e.target.dataset.id));
        
        adminActions.appendChild(editBtn);
        adminActions.appendChild(deleteBtn);
        card.appendChild(adminActions);
    });
};

// Function to show add Pokemon form
const showAddPokemonForm = () => {
    // Create a simple modal form
    const formHTML = `
        <div class="pokemon-form-modal">
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
        </div>
    `;
    
    // Add form to body
    const formContainer = document.createElement('div');
    formContainer.innerHTML = formHTML;
    document.body.appendChild(formContainer);
    
    // Add event listeners
    document.getElementById('cancel-pokemon').addEventListener('click', () => {
        document.body.removeChild(formContainer);
    });
    
    document.getElementById('add-pokemon-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
        }
    });
};

// Function to handle editing a Pokemon
const handleEditPokemon = async (pokemonId) => {
    try {
        // Fetch current Pokemon data
        const pokemon = await apiService.pokemon.getById(pokemonId);
        
        // Create edit form similar to add form but pre-populated
        const formHTML = `
            <div class="pokemon-form-modal">
                <div class="pokemon-form-content">
                    <h2>Edit Pokemon</h2>
                    <form id="edit-pokemon-form">
                        <div class="form-group">
                            <label for="edit-name">Name:</label>
                            <input type="text" id="edit-name" value="${pokemon.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-type">Type:</label>
                            <input type="text" id="edit-type" value="${pokemon.type}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-price">Price:</label>
                            <input type="number" id="edit-price" step="0.01" min="0" value="${pokemon.price}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-stock">Stock:</label>
                            <input type="number" id="edit-stock" min="0" value="${pokemon.stock}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-image_url">Image URL:</label>
                            <input type="text" id="edit-image_url" value="${pokemon.image_url || ''}">
                        </div>
                        <div class="form-group">
                            <label for="edit-description">Description:</label>
                            <textarea id="edit-description" rows="3">${pokemon.description || ''}</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" id="cancel-edit">Cancel</button>
                            <button type="submit">Update Pokemon</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Add form to body
        const formContainer = document.createElement('div');
        formContainer.innerHTML = formHTML;
        document.body.appendChild(formContainer);
        
        // Add event listeners
        document.getElementById('cancel-edit').addEventListener('click', () => {
            document.body.removeChild(formContainer);
        });
        
        document.getElementById('edit-pokemon-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedPokemon = {
                name: document.getElementById('edit-name').value,
                type: document.getElementById('edit-type').value,
                price: parseFloat(document.getElementById('edit-price').value),
                stock: parseInt(document.getElementById('edit-stock').value),
                image_url: document.getElementById('edit-image_url').value,
                description: document.getElementById('edit-description').value
            };
            
            try {
                await apiService.pokemon.update(pokemonId, updatedPokemon);
                alert('Pokemon updated successfully!');
                document.body.removeChild(formContainer);
                loadPokemonProducts(); // Refresh the product list
            } catch (error) {
                alert(`Error updating Pokemon: ${error.message}`);
            }
        });
    } catch (error) {
        alert(`Error fetching Pokemon data: ${error.message}`);
    }
};

// Function to handle deleting a Pokemon
const handleDeletePokemon = async (pokemonId) => {
    if (confirm('Are you sure you want to delete this Pokemon?')) {
        try {
            await apiService.pokemon.delete(pokemonId);
            alert('Pokemon deleted successfully!');
            loadPokemonProducts(); // Refresh the product list
        } catch (error) {
            alert(`Error deleting Pokemon: ${error.message}`);
        }
    }
};