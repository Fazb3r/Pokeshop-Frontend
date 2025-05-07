document.getElementById('producto-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const imagen = document.getElementById('imagen').value;
    const token = localStorage.getItem('authToken');

    const res = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: nombre, price: precio, image: imagen })
    });

    const data = await res.json();
    if (res.ok) {
        alert('Producto añadido');
        window.location.href = 'index.html';
    } else {
        alert('Error: ' + data.message);
    }
});
