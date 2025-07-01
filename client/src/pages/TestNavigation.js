// Simple test component to verify React Router Link navigation works
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TestNavigation = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch a few products for testing
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/maintenance/products');
        if (response.ok) {
          const data = await response.json();
          const activeProducts = data
            .filter(product => product.productstatus === 'active')
            .slice(0, 3); // Just get 3 for testing
          setProducts(activeProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading test products...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Navigation Test Page</h1>
      <p>Click on any product below to test navigation to ProductDetailsPage:</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{product.productname}</h3>
                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>ID: {product.id}</p>
                <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold', color: '#333' }}>₱{product.productprice}</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#999' }}>Click to view details</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🔧 Debug Info:</h3>
        <p><strong>Total products loaded:</strong> {products.length}</p>
        <p><strong>Expected routes:</strong></p>
        <ul>
          {products.map(product => (
            <li key={product.id}>
              <code>/product/{product.id}</code> → {product.productname}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TestNavigation;
