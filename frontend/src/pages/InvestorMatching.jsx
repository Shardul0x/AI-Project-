import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InvestorMatching.css';

const InvestorMatching = () => {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startupInfo, setStartupInfo] = useState(null);

  useEffect(() => {
    loadStartupInfo();
  }, []);

  const loadStartupInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/advisor/my-startup', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.hasStartup) {
        setStartupInfo(response.data.startup);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const findInvestors = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/investors/match',
        { startup: startupInfo },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
      );
      
      setInvestors(response.data.investors);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="investor-container">
      <div className="investor-header">
        <h1>💰 Investor Matching</h1>
        <p>Find the perfect investors for your startup</p>
      </div>

      {!startupInfo && (
        <div className="no-startup-card">
          <h2>⚠️ No Startup Data</h2>
          <p>Please add your startup details in the Success Prediction page first</p>
        </div>
      )}

      {startupInfo && (
        <>
          <div className="startup-summary-card">
            <h2>Your Startup Profile</h2>
            <div className="profile-grid">
              <div><strong>Name:</strong> {startupInfo.name}</div>
              <div><strong>Category:</strong> {startupInfo.category}</div>
              <div><strong>Team Size:</strong> {startupInfo.team_size}</div>
              <div><strong>Funding:</strong> ${startupInfo.funding?.total?.toLocaleString() || 0}</div>
            </div>
            <button onClick={findInvestors} disabled={loading} className="match-btn">
              {loading ? 'Finding Investors...' : 'Find Matching Investors 🎯'}
            </button>
          </div>

          {investors.length > 0 && (
            <div className="investors-grid">
              {investors.map((investor, idx) => (
                <div key={idx} className="investor-card">
                  <div className="investor-header">
                    <div className="investor-logo">{investor.name.charAt(0)}</div>
                    <div>
                      <h3>{investor.name}</h3>
                      <div className="match-score">
                        Match: <span className="score">{investor.match_score}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="investor-details">
                    <div className="detail-row">
                      <span className="label">Focus:</span>
                      <span>{investor.focus.join(', ')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Stage:</span>
                      <span>{investor.stage}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Why Match:</span>
                      <span>{investor.reason}</span>
                    </div>
                  </div>
                  
                  <button className="contact-btn">Contact Investor</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InvestorMatching;
