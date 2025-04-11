// src/components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      marginTop: '2rem', 
      padding: '1rem', 
      backgroundColor: '#f8f9fa', 
      textAlign: 'center' 
    }}>
      <p>&copy; {new Date().getFullYear()} Seven Four Clothing. All rights reserved.</p>
    </footer>
  );
};

export default Footer;