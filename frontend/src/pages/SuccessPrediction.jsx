import React, { useState } from 'react';
import axios from 'axios';
import './SuccessPrediction.css';

const SuccessPrediction = () => {
  const [formData, setFormData] = useState({
    startup_name: '',
    funding_total: '',
    founded_year: new Date().getFullYear(),
    category: 'Technology',
    location: '',
    team_size: '',
    funding_rounds: '0',
    monthly_revenue: '0',
    user_growth_rate: '0.5',
    burn_rate: '0',
    market_size: '1000000'
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'Technology', 'Healthcare', 'Fintech', 'E-commerce', 
    'Education', 'SaaS', 'AI/ML', 'Blockchain', 'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/predictions/success', {
        funding_total: parseFloat(formData.funding_total),
        founded_year: parseInt(formData.founded_year),
        category: formData.category,
        location: formData.location,
        team_size: parseInt(formData.team_size),
        funding_rounds: parseInt(formData.funding_rounds),
        monthly_revenue: parseFloat(formData.monthly_revenue),
        user_growth_rate: parseFloat(formData.user_growth_rate),
        burn_rate: parseFloat(formData.burn_rate),
        market_size: parseFloat(formData.market_size)
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPrediction(response.data);
    } catch (err) {
      setError('Error making prediction. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-container">
      <h1>Startup Success Prediction</h1>
      <p className="subtitle">Get AI-powered insights about your startup's potential</p>

      <div className="content-wrapper">
        <form onSubmit={handleSubmit} className="prediction-form">
          <div className="form-group">
            <label>Startup Name</label>
            <input
                type="text"
                name="startup_name"
                value={formData.startup_name}
                onChange={handleChange}
                placeholder="Enter startup name"
                required
            />
         </div>


          <div className="form-row">
            <div className="form-group">
              <label>Total Funding (INR)</label>
              <input
                type="number"
                name="funding_total"
                value={formData.funding_total}
                onChange={handleChange}
                placeholder="e.g., 500000"
                required
              />
            </div>

            <div className="form-group">
              <label>Founded Year</label>
              <input
                type="number"
                name="founded_year"
                value={formData.founded_year}
                onChange={handleChange}
                min="1990"
                max={new Date().getFullYear()}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., San Francisco"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Team Size</label>
              <input
                type="number"
                name="team_size"
                value={formData.team_size}
                onChange={handleChange}
                placeholder="e.g., 10"
                required
              />
            </div>

            <div className="form-group">
              <label>Funding Rounds</label>
              <input
                type="number"
                name="funding_rounds"
                value={formData.funding_rounds}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Analyzing...' : 'Predict Success'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {prediction && (
          <div className="prediction-result">
            <h2>Prediction Results</h2>
            <div className="result-card">
              <div className="probability-section">
                <div className="probability-circle" style={{
                  background: `conic-gradient(#4CAF50 ${prediction.probability * 3.6}deg, #e0e0e0 0deg)`
                }}>
                  <div className="probability-inner">
                    <span className="probability-value">{prediction.probability}%</span>
                    <span className="probability-label">Success Rate</span>
                  </div>
                </div>
              </div>

              <div className="prediction-details">
                <div className="detail-item">
                  <span className="detail-label">Prediction:</span>
                  <span className={`detail-value ${prediction.prediction.toLowerCase()}`}>
                    {prediction.prediction}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Confidence:</span>
                  <span className="detail-value">{prediction.confidence}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Device:</span>
                  <span className="detail-value">{prediction.processing_device || 'CPU'}</span>
                </div>
              </div>

              <div className="recommendations">
                <h3>Recommendations</h3>
                <ul>
                  {prediction.probability > 70 && (
                    <>
                      <li>✓ Strong potential for success - focus on scaling</li>
                      <li>✓ Consider approaching Series A investors</li>
                      <li>✓ Build strategic partnerships</li>
                    </>
                  )}
                  {prediction.probability > 40 && prediction.probability <= 70 && (
                    <>
                      <li>→ Moderate potential - strengthen your fundamentals</li>
                      <li>→ Focus on user acquisition and retention</li>
                      <li>→ Refine your business model</li>
                    </>
                  )}
                  {prediction.probability <= 40 && (
                    <>
                      <li>⚠ Consider pivoting or adjusting strategy</li>
                      <li>⚠ Focus on market validation</li>
                      <li>⚠ Build stronger team capabilities</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPrediction;
