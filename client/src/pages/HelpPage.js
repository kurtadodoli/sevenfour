import React from 'react';
import './HelpPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faMoneyBill, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const HelpPage = () => {
  return (
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
              <h3>Cash on Delivery Only</h3>
              <p>Payment will be collected upon delivery of your items</p>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="section-content">
            <h2>FAQ</h2>
            <div className="faq-icon">
              <div className="icon-circle large">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </div>
              <p>Need assistance? Reach out to us through our social media channels!</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;