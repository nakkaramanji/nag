document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:8000/api';

    // Forms and Tables
    const categoryForm = document.getElementById('category-form');
    const categoriesTable = document.getElementById('categories-table').getElementsByTagName('tbody')[0];
    const productsTable = document.getElementById('products-table').getElementsByTagName('tbody')[0];
    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status'); 

    // Edit Modal
    const editModal = document.getElementById('edit-modal');
    const closeModal = document.querySelector('.close-button');
    const editProductForm = document.getElementById('edit-product-form');
    const editProductId = document.getElementById('edit-product-id');
    const editProductName = document.getElementById('edit-product-name');
    const editProductCategory = document.getElementById('edit-product-category');
    const editProductPrice = document.getElementById('edit-product-price');
    const editProductStock = document.getElementById('edit-product-stock');

    let categories = [];

    // Fetch and display categories
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${apiUrl}/categories`);
            const result = await response.json();
            if (response.ok) {
                categories = result.data;
                categoriesTable.innerHTML = '';
                editProductCategory.innerHTML = '';
                categories.forEach(cat => {
                    const row = categoriesTable.insertRow();
                    row.innerHTML = `<td>${cat.category_id}</td><td>${cat.category_name}</td><td>${cat.description || ''}</td><td><button class="delete-category-btn" data-id="${cat.category_id}">Delete</button></td>`;
                    const option = document.createElement('option');
                    option.value = cat.category_id;
                    option.textContent = cat.category_name;
                    editProductCategory.appendChild(option);
                });
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (err) {
            alert('Failed to fetch categories.');
        }
    };

    // Fetch and display products
    const fetchProducts = async () => {
        try {
            const response = await fetch(`${apiUrl}/products`);
            const result = await response.json();
            if (response.ok) {
                productsTable.innerHTML = '';
                console.log('Rendering products:', result.data); // Debug log
                result.data.forEach(prod => {
                    const row = productsTable.insertRow();
                    row.innerHTML = `
                        <td>${prod.product_id}</td>
                        <td>${prod.product_name}</td>
                        <td>${prod.category_name}</td>
                        <td>${prod.price}</td>
                        <td>${prod.stock}</td>
                        <td><button class="edit-btn" data-id="${prod.product_id}">Edit</button></td>
                    `;
                });
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (err) {
            alert('Failed to fetch products.');
        }
    };

    // Add new category
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('category-name').value;
        const description = document.getElementById('category-description').value;
        
        try {
            const response = await fetch(`${apiUrl}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_name: name, description: description })
            });
            const result = await response.json();
            if (response.ok) {
                categoryForm.reset();
                fetchCategories();
                fetchProducts();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (err) {
            alert('Failed to add category.');
        }
    });

    // Handle Excel file upload
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('excel-file');
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            const response = await fetch(`${apiUrl}/upload`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            uploadStatus.textContent = result.message || `Error: ${result.error} ${result.details ? result.details.join(', ') : ''}`;
            uploadStatus.style.color = response.ok ? 'green' : 'red';
            if (response.ok) {
                fetchProducts();
            }
        } catch (err) {
            uploadStatus.textContent = 'File upload failed.';
            uploadStatus.style.color = 'red';
        }
    });
    
    // Open edit modal
    productsTable.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const productId = e.target.dataset.id;
            const response = await fetch(`${apiUrl}/products`);
            const result = await response.json();
            const product = result.data.find(p => p.product_id == productId);

            if (product) {
                editProductId.value = product.product_id;
                editProductName.value = product.product_name;
                editProductPrice.value = product.price;
                editProductStock.value = product.stock;
                
                const category = categories.find(c => c.category_name === product.category_name);
                if (category) {
                    editProductCategory.value = category.category_id;
                }
                
                editModal.style.display = 'block';
            }
        }
    });
    
    // Close modal
    closeModal.onclick = () => {
        editModal.style.display = 'none';
    };
    window.onclick = (event) => {
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    };

    // Handle product edit form submission
    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editProductId.value;
        const name = editProductName.value.trim();
        const price = parseFloat(editProductPrice.value);
        const stock = parseInt(editProductStock.value);
        const categoryId = editProductCategory.value;

        // Validation
        let errorMsg = '';
        if (!name) errorMsg = 'Product name is required.';
        else if (!categoryId) errorMsg = 'Category is required.';
        else if (isNaN(price) || price <= 0) errorMsg = 'Price must be greater than 0.';
        else if (isNaN(stock) || stock < 0) errorMsg = 'Stock must be 0 or greater.';

        if (errorMsg) {
            alert(errorMsg);
            return;
        }

        const data = {
            product_name: name,
            category_id: categoryId,
            price: price,
            stock: stock,
        };

        try {
            const response = await fetch(`${apiUrl}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                editModal.style.display = 'none';
                fetchProducts();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (err) {
            alert('Failed to update product.');
        }
    });

    // Handle delete category button click
    categoriesTable.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-category-btn')) {
            const categoryId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this category?')) {
                try {
                    const response = await fetch(`${apiUrl}/categories/${categoryId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    if (response.ok) {
                        fetchCategories();
                        fetchProducts();
                    } else {
                        alert(`Error: ${result.error}`);
                    }
                } catch (err) {
                    alert('Failed to delete category.');
                }
            }
        }
    });

    // Initial data fetch
    fetchCategories();
    fetchProducts();
}); 