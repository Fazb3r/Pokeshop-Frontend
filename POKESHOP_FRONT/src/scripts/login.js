// POKESHOP_FRONT/src/scripts/login.js
import apiService from '../services/api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Get login form
    const loginForm = document.querySelector('.form-login form');
    
    // Add event listener for form submission
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Get form values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Validate form
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        try {
            // Show loading state (could add a spinner here)
            const button = document.querySelector('.sing-ing');
            button.disabled = true;
            button.textContent = 'Logging in...';
            
            // Call login API
            const response = await apiService.auth.login(username, password);
            
            // Store token in localStorage
            localStorage.setItem('pokeShopToken', response.token);
            
            // Store user info
            localStorage.setItem('pokeShopUser', JSON.stringify({
                id: response.id,
                username: response.username,
                userType: response.userType
            }));
            
            // Redirect to main page
            window.location.href = 'index.html';
        } catch (error) {
            // Display error message
            alert(`Login failed: ${error.message}`);
        } finally {
            // Reset button state
            const button = document.querySelector('.sing-ing');
            button.disabled = false;
            button.textContent = 'login';
        }
    });
});