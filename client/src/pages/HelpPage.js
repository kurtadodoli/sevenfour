import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HelpPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faMoneyBill, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const HelpPage = () => {
  const navigate = useNavigate();

  const handleFAQClick = () => {
    navigate('/faq');
  };

  return (
    <div className="help-page-wrapper">
      <div className="help-container">
      <div className="help-header">
        <h1>Help Center</h1>
        <div className="header-line"></div>
      </div>

      <div className="content-grid">
        <section className="contact-section">
          <div className="section-content">
            <h2>Connect With Us</h2>
            <div className="social-links">
              <a 
                href="https://www.facebook.com/SevenFourClo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon-wrapper"
              >
                <div className="icon-circle">
                  <FontAwesomeIcon icon={faFacebook} />
                </div>
                <span className="icon-label">Facebook</span>
              </a>
              
              <a 
                href="mailto:sevenfourclothingph@gmail.com"
                className="social-icon-wrapper"
              >
                <div className="icon-circle">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <span className="icon-label">Email</span>
              </a>
              
              <a 
                href="https://www.instagram.com/sevenfourclothing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon-wrapper"
              >
                <div className="icon-circle">
                  <FontAwesomeIcon icon={faInstagram} />
                </div>
                <span className="icon-label">Instagram</span>
              </a>
            </div>
          </div>
        </section>

        <section className="payment-section">
          <div className="section-content">
            <h2>Payment Method</h2>
            <div className="payment-info">
              <div className="icon-circle large">
                <FontAwesomeIcon icon={faMoneyBill} />
              </div>
              <h3>GCash Payment only</h3>
              <p>Pay securely using GCash before your order is processed</p>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="section-content">
            <h2>FAQ</h2>
            <div className="faq-icon" onClick={handleFAQClick} style={{ cursor: 'pointer' }}>
              <div className="icon-circle large">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </div>
              <p>Need assistance? Click here to view our frequently asked questions!</p>
            </div>          </div>
        </section>
      </div>
    </div>
    </div>
  );
};

export default HelpPage;