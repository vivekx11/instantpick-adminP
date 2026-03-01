let API_BASE_URL = 'https://instantpick-backend.onrender.com';

// Update API URL.
document.getElementById('apiUrl').addEventListener('change', (e) => {
    API_BASE_URL = e.target.value.replace(/\/$/, '');
    localStorage.setItem('apiUrl', API_BASE_URL);
    loadDashboard();
});

// Load saved API URL
window.onload = () => {
    const savedUrl = localStorage.getItem('apiUrl');
    if (savedUrl) {
        API_BASE_URL = savedUrl;
        document.getElementById('apiUrl').value = savedUrl;
    }
    loadDashboard();
};

// Show Section
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    document.getElementById(sectionName).classList.add('active');
    event.target.closest('.nav-item').classList.add('active');
    
    loadSectionData(sectionName);
}

// Load Dashboard Stats
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalUsers').textContent = data.stats.totalUsers;
            document.getElementById('totalShops').textContent = data.stats.totalShops;
            document.getElementById('totalProducts').textContent = data.stats.totalProducts;
            document.getElementById('totalOrders').textContent = data.stats.totalOrders;
            document.getElementById('activeShops').textContent = data.stats.activeShops;
            document.getElementById('pendingOrders').textContent = data.stats.pendingOrders;
            
            updateLastUpdate();
        }
        
        const activeSection = document.querySelector('.section.active').id;
        loadSectionData(activeSection);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to connect to backend. Check API URL.');
    }
}

// Load Section Data
async function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            break;
        case 'users':
            await loadUsers();
            break;
        case 'shops':
            await loadShops();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'orders':
            await loadOrders();
            break;
        case 'logs':
            await loadLogs();
            break;
    }
}

// Load Users
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`);
        const data = await response.json();
        
        if (data.success) {
            let html = '<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>';
            
            data.users.forEach(user => {
                html += `
                    <tr>
                        <td><strong>${user.name}</strong></td>
                        <td>${user.email}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td><span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">${user.isActive ? 'Active' : 'Blocked'}</span></td>
                        <td>${new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                            <button class="btn ${user.isActive ? 'btn-warning' : 'btn-success'}" onclick="toggleUserStatus('${user._id}')">
                                ${user.isActive ? 'Block' : 'Unblock'}
                            </button>
                            <button class="btn btn-danger" onclick="deleteUser('${user._id}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            document.getElementById('usersContent').innerHTML = html;
        }
    } catch (error) {
        document.getElementById('usersContent').innerHTML = '<div class="error">❌ Error loading users. Check backend connection.</div>';
    }
}

// Load Shops
async function loadShops() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/shops`);
        const data = await response.json();
        
        if (data.success) {
            let html = '<table><thead><tr><th>Shop Name</th><th>Owner</th><th>Contact</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>';
            
            data.shops.forEach(shop => {
                html += `
                    <tr>
                        <td><strong>${shop.name}</strong></td>
                        <td>${shop.ownerId?.name || 'N/A'}</td>
                        <td>${shop.ownerId?.phone || shop.ownerId?.email || 'N/A'}</td>
                        <td><span class="status-badge ${shop.isActive ? 'status-active' : 'status-inactive'}">${shop.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td>${new Date(shop.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                            <button class="btn ${shop.isActive ? 'btn-warning' : 'btn-success'}" onclick="toggleShopStatus('${shop._id}')">
                                ${shop.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button class="btn btn-danger" onclick="deleteShop('${shop._id}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            document.getElementById('shopsContent').innerHTML = html;
        }
    } catch (error) {
        document.getElementById('shopsContent').innerHTML = '<div class="error">❌ Error loading shops. Check backend connection.</div>';
    }
}

// Load Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/products`);
        const data = await response.json();
        
        if (data.success) {
            let html = '<table><thead><tr><th>Product Name</th><th>Shop</th><th>Price</th><th>Stock</th><th>Created</th><th>Actions</th></tr></thead><tbody>';
            
            data.products.forEach(product => {
                html += `
                    <tr>
                        <td><strong>${product.name}</strong></td>
                        <td>${product.shopId?.name || 'N/A'}</td>
                        <td>₹${product.price.toLocaleString('en-IN')}</td>
                        <td>${product.stock}</td>
                        <td>${new Date(product.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            document.getElementById('productsContent').innerHTML = html;
        }
    } catch (error) {
        document.getElementById('productsContent').innerHTML = '<div class="error">❌ Error loading products. Check backend connection.</div>';
    }
}

// Load Orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/orders`);
        const data = await response.json();
        
        if (data.success) {
            let html = '<table><thead><tr><th>Order ID</th><th>User</th><th>Shop</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>';
            
            data.orders.forEach(order => {
                html += `
                    <tr>
                        <td><code>${order._id.substring(0, 8)}...</code></td>
                        <td>${order.userId?.name || 'N/A'}</td>
                        <td>${order.shopId?.name || 'N/A'}</td>
                        <td><strong>₹${order.totalAmount.toLocaleString('en-IN')}</strong></td>
                        <td><span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></td>
                        <td>${new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                            <select onchange="updateOrderStatus('${order._id}', this.value)" class="btn">
                                <option value="">Change Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            document.getElementById('ordersContent').innerHTML = html;
        }
    } catch (error) {
        document.getElementById('ordersContent').innerHTML = '<div class="error">❌ Error loading orders. Check backend connection.</div>';
    }
}

// Load Logs
async function loadLogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/logs`);
        const data = await response.json();
        
        if (data.success) {
            let html = '<div style="padding: 20px;">';
            
            html += '<h3 style="margin-bottom: 15px; color: #1f2937;">📋 Recent Users</h3>';
            html += '<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead><tbody>';
            data.logs.recentUsers.forEach(user => {
                html += `<tr><td>${user.name}</td><td>${user.email}</td><td>${user.phone || 'N/A'}</td><td>${new Date(user.createdAt).toLocaleString('en-IN')}</td></tr>`;
            });
            html += '</tbody></table><br>';
            
            html += '<h3 style="margin: 30px 0 15px; color: #1f2937;">🏪 Recent Shops</h3>';
            html += '<table><thead><tr><th>Shop Name</th><th>Status</th><th>Created</th></tr></thead><tbody>';
            data.logs.recentShops.forEach(shop => {
                html += `<tr><td>${shop.name}</td><td><span class="status-badge ${shop.isActive ? 'status-active' : 'status-inactive'}">${shop.isActive ? 'Active' : 'Inactive'}</span></td><td>${new Date(shop.createdAt).toLocaleString('en-IN')}</td></tr>`;
            });
            html += '</tbody></table><br>';
            
            html += '<h3 style="margin: 30px 0 15px; color: #1f2937;">🛒 Recent Orders</h3>';
            html += '<table><thead><tr><th>Order ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>';
            data.logs.recentOrders.forEach(order => {
                html += `<tr><td><code>${order._id.substring(0, 8)}...</code></td><td>₹${order.totalAmount.toLocaleString('en-IN')}</td><td><span class="status-badge status-${order.status}">${order.status}</span></td><td>${new Date(order.createdAt).toLocaleString('en-IN')}</td></tr>`;
            });
            html += '</tbody></table>';
            
            html += '</div>';
            document.getElementById('logsContent').innerHTML = html;
        }
    } catch (error) {
        document.getElementById('logsContent').innerHTML = '<div class="error">❌ Error loading logs. Check backend connection.</div>';
    }
}

// Toggle User Status
async function toggleUserStatus(userId) {
    if (!confirm('Are you sure you want to change user status?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/toggle-status`, {
            method: 'PATCH'
        });
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ User status updated successfully!');
            loadUsers();
            loadDashboard();
        }
    } catch (error) {
        showNotification('❌ Error updating user status', 'error');
    }
}

// Delete User
async function deleteUser(userId) {
    if (!confirm('⚠️ Are you sure you want to delete this user? This action cannot be undone!')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ User deleted successfully!');
            loadUsers();
            loadDashboard();
        }
    } catch (error) {
        showNotification('❌ Error deleting user', 'error');
    }
}

// Toggle Shop Status
async function toggleShopStatus(shopId) {
    if (!confirm('Are you sure you want to change shop status?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/shops/${shopId}/toggle-status`, {
            method: 'PATCH'
        });
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ Shop status updated successfully!');
            loadShops();
            loadDashboard();
        }
    } catch (error) {
        showNotification('❌ Error updating shop status', 'error');
    }
}

// Delete Shop
async function deleteShop(shopId) {
    if (!confirm('⚠️ Are you sure you want to delete this shop? All products will also be deleted! This action cannot be undone!')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/shops/${shopId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ Shop and products deleted successfully!');
            loadShops();
            loadDashboard();
        }
    } catch (error) {
        showNotification('❌ Error deleting shop', 'error');
    }
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('⚠️ Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ Product deleted successfully!');
            loadProducts();
            loadDashboard();
        }
    } catch (error) {
        showNotification('❌ Error deleting product', 'error');
    }
}

// Update Order Status
async function updateOrderStatus(orderId, status) {
    if (!status) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ Order status updated successfully!');
            loadOrders();
            loadDashboard();
        }
    } catch (error) {
        showNotification('❌ Error updating order status', 'error');
    }
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update Last Update Time
function updateLastUpdate() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = `Last updated: ${now.toLocaleTimeString('en-IN')}`;
}

// Show Error
function showError(message) {
    document.getElementById('dashboard').innerHTML = `<div class="error">${message}</div>`;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

