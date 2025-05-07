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

  // Function to update item quantity in the cart
  async function updateCartItem(cartItemId, newQuantity) {
    const token = localStorage.getItem('pokeShopToken');
    if (!token) {
      alert('Debes iniciar sesión');
      return false;
    }

    try {
      console.log(`Actualizando item ${cartItemId} a cantidad ${newQuantity}`);
      
      // Usar el mismo endpoint que se muestra en el código de paste.txt
      const response = await fetch(`http://localhost:3000/api/cart/item/${cartItemId}`, {
        method: 'PUT',  // Usar PUT en lugar de PATCH
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: parseInt(newQuantity) })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server responded with ${response.status}: ${errorText}`);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      console.log('Actualización exitosa, recargando carrito');
      // Refresh the cart after updating
      renderCart();
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      alert(`Error al actualizar el carrito: ${error.message}`);
      return false;
    }
  }

  async function renderCart() {
    const token = localStorage.getItem('pokeShopToken'); 
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
        console.log('Datos del carrito:', data); // Para depuración
        
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
          
          // Identificar el ID correcto para el elemento del carrito
          const itemId = item.cart_item_id || item.id;
          
          // Return formatted HTML with input for quantity
          return `
            <div style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ccc;">
              <strong>${item.name}</strong><br>
              Cantidad: 
              <input type="number" min="1" value="${item.quantity}" style="width:60px"
                onchange="updateCartItem(${itemId}, this.value)">
              <br>
              $${validPrice.toFixed(2)} c/u → Total: $${(validPrice * item.quantity).toFixed(2)}
            </div>
          `;
        }).join('');

        cartPanel.innerHTML = `
          <h2>Carrito de Compras</h2>
          ${cartItems}
          <p style="font-weight: bold; margin-top: 10px;">Total: $${total.toFixed(2)}</p>
          <div style="display: flex; justify-content: space-between; margin-top: 15px;">
            <button id="buy-cart-btn" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Comprar</button>
            <button id="close-cart-btn" style="padding: 10px 20px; background-color: #ff5252; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
          </div>
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
    const token = localStorage.getItem('pokeShopToken');
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
      console.log('Datos recibidos del historial:', data); // Log para depuración
      
      if (!data || data.length === 0) {
        cartPanel.innerHTML = `
          <h2>Historial de compras</h2>
          <p>No hay historial de compras disponible.</p>
          <button id="close-history-btn" style="padding: 8px 16px; background-color: #ff5252; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 15px;">Cerrar</button>
        `;
      } else {
        const orderHistory = data.map(order => {
          // Validar y formatear la fecha - Ahora buscamos created_at en lugar de date
          let formattedDate = 'Fecha no disponible';
          if (order.created_at) {
            const dateObj = new Date(order.created_at);
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          }
          
          // Validar y formatear el total - Ahora buscamos total_amount en lugar de total
          let totalAmount = 0;
          if (order.total_amount !== undefined && order.total_amount !== null) {
            if (typeof order.total_amount === 'string') {
              // Intentar extraer solo números y puntos decimales
              const numericString = order.total_amount.replace(/[^\d.]/g, '');
              totalAmount = parseFloat(numericString) || 0;
            } else if (typeof order.total_amount === 'number') {
              totalAmount = order.total_amount;
            }
          }
          
          // Generar HTML para cada orden
          return `
            <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
              <strong>Orden ID:</strong> ${order.id || 'N/A'}<br>
              <strong>Fecha:</strong> ${formattedDate}<br>
              <strong>Total:</strong> $${totalAmount.toFixed(2)}<br>
              <strong>Estado:</strong> ${order.status || 'N/A'}
            </div>
          `;
        }).join('');
  
        cartPanel.innerHTML = `
          <h2 style="text-align: center; margin-bottom: 20px;">Historial de compras</h2>
          ${orderHistory}
          <button id="close-history-btn" style="padding: 10px 20px; background-color: #ff5252; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 15px; display: block; width: 100px; margin-left: auto; margin-right: auto;">Cerrar</button>
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
        <button id="close-history-btn" style="padding: 8px 16px; background-color: #ff5252; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 15px;">Cerrar</button>
      `;
      
      document.getElementById('close-history-btn')?.addEventListener('click', () => {
        cartPanel.style.display = 'none';
      });
    }
  }
});