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
  document.body.appendChild(cartPanel);

  async function renderCart() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Debes iniciar sesión');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!data.items || data.items.length === 0) {
        cartPanel.innerHTML = '<h2>Tu carrito está vacío.</h2>';
      } else {
        const total = data.items.reduce((sum, item) => sum + item.price_at_time * item.quantity, 0);
        cartPanel.innerHTML = '<h2>Carrito de Compras</h2>' + 
          data.items.map(item => `
            <div style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ccc;">
              <strong>${item.name}</strong><br>
              ${item.quantity} × $${item.price_at_time.toFixed(2)} = $${(item.quantity * item.price_at_time).toFixed(2)}
            </div>
          `).join('') +
          `<p style="font-weight: bold; margin-top: 10px;">Total: $${total.toFixed(2)}</p>
           <button id="buy-cart-btn" style="padding: 10px 20px; margin-top: 10px;">Comprar</button>`;
      }

      cartPanel.style.display = 'block';

      document.getElementById('buy-cart-btn')?.addEventListener('click', async () => {
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
          cartPanel.innerHTML = '';
          cartPanel.style.display = 'none';
        } else {
          alert('Error al procesar la compra.');
        }
      });
    } catch (err) {
      cartPanel.innerHTML = '<p>Error al cargar el carrito.</p>';
    }
  }

  window.renderPurchaseHistoryPanel = async function () {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Debes iniciar sesión');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!data || data.length === 0) {
        cartPanel.innerHTML = '<h2>No hay historial de compras.</h2>';
      } else {
        cartPanel.innerHTML = '<h2>Historial de compras</h2>' + data.map(order => `
          <div style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ccc;">
            <strong>Orden ID:</strong> ${order.id}<br>
            <strong>Fecha:</strong> ${new Date(order.date).toLocaleString()}<br>
            <strong>Total:</strong> $${order.total.toFixed(2)}
          </div>`).join('');
      }

      cartPanel.style.display = 'block';
    } catch (err) {
      cartPanel.innerHTML = '<p>Error al cargar el historial.</p>';
    }
  }

  const icons = document.querySelectorAll('.shop-icon');
  if (icons.length) {
    icons[icons.length - 1].addEventListener('click', () => {
      renderCart();
    });
  }

  const historyButton = document.querySelector('button[onclick="renderPurchaseHistoryPanel()"]');
  if (historyButton) {
    historyButton.addEventListener('click', (e) => {
      e.preventDefault();
      renderHistory();
    });
  }
});