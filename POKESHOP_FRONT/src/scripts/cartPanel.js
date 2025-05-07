document.addEventListener('DOMContentLoaded', () => {
  const cartPanel = document.createElement('div');
  cartPanel.id = 'cart-panel';
  cartPanel.style.display = 'none';
  cartPanel.style.backgroundColor = '#ffffff';
  cartPanel.style.border = '2px solid #333';
  cartPanel.style.borderRadius = '10px';
  cartPanel.style.padding = '20px';
  cartPanel.style.margin = '20px auto';
  cartPanel.style.maxWidth = '800px';
  cartPanel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  cartPanel.style.position = 'fixed';
  cartPanel.style.top = '50%';
  cartPanel.style.left = '50%';
  cartPanel.style.transform = 'translate(-50%, -50%)';
  cartPanel.style.zIndex = '1000';
  cartPanel.style.maxHeight = '80vh';
  cartPanel.style.overflowY = 'auto';
  document.body.appendChild(cartPanel);

  // Expose renderCartPanel globally
  window.renderCartPanel = async function() {
    renderCart();
  };

  // Expose showCartModal as a global function
  window.showCartModal = function() {
    renderCart();
  };

  // Expose showPurchaseHistory as a global function
  window.showPurchaseHistory = function() {
    renderPurchaseHistoryPanel();
  };

  async function renderCart() {
    const token = localStorage.getItem('pokeShopToken'); // Using the token name from index.js
    if (!token) {
      alert('Debes iniciar sesión');
      return;
    }

    try {
      cartPanel.innerHTML = '<h2>Cargando carrito...</h2>';
      cartPanel.style.display = 'block';

      const res = await fetch('http://localhost:3000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      
      if (!data.items || data.items.length === 0) {
        cartPanel.innerHTML = '<h2>Tu carrito está vacío.</h2><button id="close-cart-btn">Cerrar</button>';
      } else {
        // Calculate total and ensure price_at_time is a number
        let total = 0;
        const cartItems = data.items.map(item => {
          // Convert price to number if it's not already
          const price = typeof item.price_at_time === 'string' 
            ? parseFloat(item.price_at_time) 
            : Number(item.price_at_time);
          
          // Ensure price is a valid number
          const validPrice = !isNaN(price) ? price : 0;
          
          // Add to total
          total += validPrice * item.quantity;
          
          // Return formatted HTML
          return `
            <div style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ccc;">
              <strong>${item.name}</strong><br>
              ${item.quantity} × $${validPrice.toFixed(2)} = $${(validPrice * item.quantity).toFixed(2)}
            </div>
          `;
        }).join('');

        cartPanel.innerHTML = `
          <h2>Carrito de Compras</h2>
          ${cartItems}
          <p style="font-weight: bold; margin-top: 10px;">Total: $${total.toFixed(2)}</p>
          <button id="buy-cart-btn" style="padding: 10px 20px; margin-top: 10px;">Comprar</button>
          <button id="close-cart-btn" style="padding: 10px 20px; margin-top: 10px; margin-left: 10px;">Cerrar</button>
        `;
      }

      document.getElementById('buy-cart-btn')?.addEventListener('click', async () => {
        try {
          const buyRes = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
          });

          if (buyRes.ok) {
            alert('¡Compra realizada!');
            cartPanel.style.display = 'none';
          } else {
            alert(`Error al procesar la compra: ${await buyRes.text()}`);
          }
        } catch (error) {
          console.error('Error during purchase:', error);
          alert(`Error al procesar la compra: ${error.message}`);
        }
      });

      document.getElementById('close-cart-btn')?.addEventListener('click', () => {
        cartPanel.style.display = 'none';
      });
    } catch (err) {
      console.error('Error loading cart:', err);
      cartPanel.innerHTML = `
        <h2>Error al cargar el carrito</h2>
        <p>${err.message || 'Ocurrió un error inesperado'}</p>
        <button id="close-cart-btn">Cerrar</button>
      `;
      
      document.getElementById('close-cart-btn')?.addEventListener('click', () => {
        cartPanel.style.display = 'none';
      });
    }
  }

  // Define the renderPurchaseHistoryPanel function
  window.renderPurchaseHistoryPanel = async function () {
    const token = localStorage.getItem('pokeShopToken'); // Using the token name from index.js
    if (!token) {
      alert('Debes iniciar sesión');
      return;
    }

    try {
      cartPanel.innerHTML = '<h2>Cargando historial...</h2>';
      cartPanel.style.display = 'block';

      const res = await fetch('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      
      if (!data || data.length === 0) {
        cartPanel.innerHTML = `
          <h2>No hay historial de compras.</h2>
          <button id="close-history-btn" style="padding: 10px 20px; margin-top: 10px;">Cerrar</button>
        `;
      } else {
        const orderHistory = data.map(order => {
          // Handle potentially missing or invalid date
          let dateDisplay = 'Fecha no disponible';
          try {
            dateDisplay = new Date(order.date).toLocaleString();
          } catch (e) {
            console.warn('Invalid date format:', order.date);
          }
          
          // Ensure total is a number
          const total = typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0;
          
          return `
            <div style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ccc;">
              <strong>Orden ID:</strong> ${order.id}<br>
              <strong>Fecha:</strong> ${dateDisplay}<br>
              <strong>Total:</strong> $${total.toFixed(2)}
            </div>
          `;
        }).join('');

        cartPanel.innerHTML = `
          <h2>Historial de compras</h2>
          ${orderHistory}
          <button id="close-history-btn" style="padding: 10px 20px; margin-top: 10px;">Cerrar</button>
        `;
      }

      document.getElementById('close-history-btn')?.addEventListener('click', () => {
        cartPanel.style.display = 'none';
      });
    } catch (err) {
      console.error('Error loading purchase history:', err);
      cartPanel.innerHTML = `
        <h2>Error al cargar el historial</h2>
        <p>${err.message || 'Ocurrió un error inesperado'}</p>
        <button id="close-history-btn">Cerrar</button>
      `;
      
      document.getElementById('close-history-btn')?.addEventListener('click', () => {
        cartPanel.style.display = 'none';
      });
    }
  };

  // Make the Pokeball (shop-icon) open the cart
  const pokeballIcon = document.querySelector('.shop-icon img');
  if (pokeballIcon) {
    pokeballIcon.addEventListener('click', () => {
      pokeballIcon.style.transform = 'scale(1.2)';
      setTimeout(() => {
        pokeballIcon.style.transform = '';
      }, 300);
      
      renderCart();
    });
  }
});