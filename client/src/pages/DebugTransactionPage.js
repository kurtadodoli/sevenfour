import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const DebugTransactionPage = () => {
  const { currentUser: user } = useAuth(); // Get current user (renamed for consistency)
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔄 DEBUG: DebugTransactionPage mounted');
    console.log('🔄 DEBUG: User from context:', user);
    console.log('🔄 DEBUG: User role:', user?.role);
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('🔄 DEBUG: Starting to fetch orders...');
        
        if (!user) {
          console.log('⏳ DEBUG: User not loaded yet, waiting...');
          setLoading(false);
          return;
        }
        
        const endpoint = (user.role === 'admin' || user.role === 'staff') 
          ? '/orders/confirmed' 
          : '/orders/me-with-items';
        
        console.log('🔄 DEBUG: Using endpoint:', endpoint);
        
        const response = await api.get(endpoint);
        console.log('📥 DEBUG: API response:', response);
        
        if (response.data.success) {
          console.log('✅ DEBUG: Orders fetched:', response.data.data?.length);
          setOrders(response.data.data || []);
        } else {
          console.error('❌ DEBUG: API returned success=false');
          setError('Failed to fetch orders');
        }
      } catch (err) {
        console.error('❌ DEBUG: Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);

  console.log('🔄 DEBUG: Rendering component with:', { 
    userLoaded: !!user, 
    userRole: user?.role,
    ordersCount: orders.length, 
    loading, 
    error 
  });

  if (loading) {
    return <div style={{padding: '20px'}}>Loading...</div>;
  }

  if (error) {
    return <div style={{padding: '20px', color: 'red'}}>Error: {error}</div>;
  }

  return (
    <div style={{padding: '20px'}}>
      <h1>Debug Transaction Page</h1>
      <p>User: {user?.email} (Role: {user?.role})</p>
      <p>Orders found: {orders.length}</p>
      
      {orders.length > 0 ? (
        <div>
          <h3>Orders:</h3>
          {orders.map((order, index) => (
            <div key={order.id || index} style={{border: '1px solid #ccc', padding: '10px', margin: '5px 0'}}>
              <strong>{order.order_number}</strong><br/>
              Customer: {order.first_name} {order.last_name}<br/>
              Amount: ₱{order.total_amount}<br/>
              Status: {order.status}
            </div>
          ))}
        </div>
      ) : (
        <p>No orders to display</p>
      )}
    </div>
  );
};

export default DebugTransactionPage;
