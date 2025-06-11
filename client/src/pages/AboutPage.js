import React from 'react';
import './AboutPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faGear, faUser } from '@fortawesome/free-solid-svg-icons';

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About SevenFour</h1>
        <div className="header-line"></div>
      </div>

      <div className="about-content">
        <section className="developers-section">
          <div className="section-title">
            <FontAwesomeIcon icon={faCode} className="section-icon" />
            <h2>Development Team</h2>
          </div>
          
          <div className="dev-grid">
            <div className="dev-card">
              <div className="dev-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="dev-info">
                <h3>Kurt Andre P. Adodoli</h3>
                <p>Computer Science</p>
              </div>
            </div>
            
            <div className="dev-card">
              <div className="dev-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="dev-info">
                <h3>Josh Russel P. Magpantay</h3>
                <p>Computer Science</p>
              </div>
            </div>
            
            <div className="dev-card">
              <div className="dev-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="dev-info">
                <h3>John Kenneth S. Marzan</h3>
                <p>Computer Science</p>
              </div>
            </div>
          </div>

          <div className="institution-banner">
            <p>Technological Institute of the Philippines</p>
          </div>
        </section>

        <section className="system-section">
          <div className="section-title">
            <FontAwesomeIcon icon={faGear} className="section-icon" />
            <h2>System Information</h2>
          </div>
          
          <div className="system-card">
            <div className="system-info">
              <h3>SevenFour Clothing</h3>
              <p>E-Commerce Platform</p>
              <p>Version 1.0.0</p>
              <div className="copyright">
                <p>© 2025 SevenFour Clothing</p>
                <p>All Rights Reserved</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;