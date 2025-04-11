// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/sfc-logo.png'; // Use correct filename with relative path

const Header = () => {
  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#fff',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
        <img 
          src={logo} 
          alt="Seven Four Logo" 
          style={{ 
            height: '50px',
            width: 'auto',
            marginLeft: '1rem'
          }}
        />
      </Link>
      <nav>
        <ul style={{ 
          display: 'flex', 
          listStyle: 'none', 
          gap: '2rem',
          margin: 0,
          padding: 0
        }}>
          <li><Link to="/" style={{ textDecoration: 'none', color: '#000', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Home</Link></li>
          <li><Link to="/products" style={{ textDecoration: 'none', color: '#000', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Products</Link></li>
          <li><Link to="/cart" style={{ textDecoration: 'none', color: '#000', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Cart</Link></li>
          <li><Link to="/login" style={{ textDecoration: 'none', color: '#000', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Login</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;