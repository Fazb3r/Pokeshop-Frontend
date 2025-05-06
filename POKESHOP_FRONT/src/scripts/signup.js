import apiService from '../services/api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Get registration form
    const registerForm = document.querySelector('.form-register form');
    
    // Add event listener for form submission
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Get form values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const userType = document.getElementById('user-type').value;
        
        // Validate form
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        if (!userType) {
            alert('Please select a user type');
            return;
        }
        
        try {
            // Show loading state
            const button = document.querySelector('.sing-ing');
            button.disabled = true;
            button.textContent = 'Registering...';
            
            // Call register API
            const response = await apiService.auth.register(username, password, userType);
            
            // Store token in localStorage
            localStorage.setItem('pokeShopToken', response.token);
            
            // Store user info
            localStorage.setItem('pokeShopUser', JSON.stringify({
                id: response.id,
                username: response.username,
                userType: response.userType
            }));
            
            // Show success message and redirect
            alert('Registration successful!');
            window.location.href = 'index.html';
        } catch (error) {
            // Display error message
            alert(`Registration failed: ${error.message}`);
        } finally {
            // Reset button state
            const button = document.querySelector('.sing-ing');
            button.disabled = false;
            button.textContent = 'Register';
        }
    });
});