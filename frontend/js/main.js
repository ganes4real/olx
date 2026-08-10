document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

async function fetchProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const products = await response.json();
        
        if (products.length === 0) {
            productsGrid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">No products found. Be the first to sell!</div>';
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                <div class="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <img src="${product.imageUrl ? 'http://localhost:5000' + product.imageUrl : 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${product.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-sm hover:text-red-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="text-xl font-bold text-gray-900 mb-1">$${product.price.toLocaleString()}</h3>
                    <p class="text-gray-600 text-sm mb-2 truncate">${product.title}</p>
                    <div class="flex justify-between items-center text-xs text-gray-500 mt-4">
                        <span class="truncate w-2/3">${product.location}</span>
                        <span>${new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        productsGrid.innerHTML = `<div class="col-span-full text-center py-10 text-red-500">Error loading products. Please make sure the backend is running.</div>`;
    }
}
