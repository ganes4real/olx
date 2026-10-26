import React from 'react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col">
          <h4>POPULAR LOCATIONS</h4>
          <ul>
            <li><a href="/?location=Kolkata">Kolkata</a></li>
            <li><a href="/?location=Mumbai">Mumbai</a></li>
            <li><a href="/?location=Chennai">Chennai</a></li>
            <li><a href="/?location=Pune">Pune</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>TRENDING LOCATIONS</h4>
          <ul>
            <li><a href="/?location=Bengaluru">Bengaluru</a></li>
            <li><a href="/?location=Hyderabad">Hyderabad</a></li>
            <li><a href="/?location=Delhi">Delhi</a></li>
            <li><a href="/?location=Noida">Noida</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>ABOUT US</h4>
          <ul>
            <li><a href="#">About OLX Group</a></li>
            <li><a href="#">Careers & Culture</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">OLX for Businesses</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>TRUST & SAFETY</h4>
          <ul>
            <li><a href="#">JWT Security Verified</a></li>
            <li><a href="#">Safety Guidelines</a></li>
            <li><a href="#">Legal & Privacy Policy</a></li>
            <li><a href="#">Community Guidelines</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <span>Help &bull; Sitemap &bull; Terms of Service</span>
          <span>All rights reserved &copy; 2006&ndash;2026 OLX Marketplace (React &bull; JWT Auth)</span>
        </div>
      </div>
    </footer>
  );
};
