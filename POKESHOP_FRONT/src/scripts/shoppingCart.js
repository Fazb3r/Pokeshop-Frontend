document.addEventListener('DOMContentLoaded', async () => {
    const cartContainer = document.getElementById('cart-container');
    const token = localStorage.getItem('pokeShopToken');
    if (!token) {
        cartContainer.innerHTML = '<p>Inicia sesión para ver tu carrito.</p>';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const cartItems = data.items || [];

        if (cartItems.length === 0) {
            cartContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
            document.getElementById('buy-button').style.display = 'none';
            return;
        }

        cartItems.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('pokemon-card');

            card.innerHTML = `
                <img src="${item.image_url}" alt="${item.name}" class="pokemon-image">
                <h3>${item.name}</h3>
                <p>Tipo: ${item.type}</p>
                <p>Precio: $${Number(item.price_at_time).toFixed(2)}</p>
                <p>Cantidad: ${item.quantity}</p>
            `;
            cartContainer.appendChild(card);
        });

        // Botón de compra
        document.getElementById('buy-button').addEventListener('click', async () => {
            const confirmPurchase = confirm("¿Confirmas la compra?");
            if (!confirmPurchase) return;

            const buyResponse = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items: cartItems })
            });

            if (buyResponse.ok) {
                alert("¡Compra exitosa!");
                window.location.href = './history.html';
            } else {
                alert("Error al procesar la compra.");
            }
        });

    } catch (error) {
        console.error("Error al cargar el carrito:", error);
        cartContainer.innerHTML = '<p>Error al cargar el carrito.</p>';
    }
});
