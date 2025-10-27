import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SuccessPrediction.css';

const SuccessPrediction = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    startup_name: '',
    category: 'Technology',
    location: '',
    founded_year: new Date().getFullYear(),
    
    // Step 2: About Your Startup
    description: '',
    problem_solving: '',
    target_audience: '',
    unique_value_proposition: '',
    business_model: '',
    
    // Step 3: Team & Funding
    team_size: '',
    funding_total: '',
    funding_rounds: '0',
    
    // Step 4: Additional (optional)
    monthly_revenue: '0',
    user_growth_rate: '0.5',
    burn_rate: '0',
    market_size: '1000000',
    
    // Strengths & Challenges
    key_strengths: [],
    main_challenges: []
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const categories = [
    'Technology', 'Healthcare', 'Fintech', 'E-commerce', 
    'Education', 'SaaS', 'AI/ML', 'Blockchain', 'Other'
  ];

  const strengthOptions = [
    'Strong technical team',
    'Experienced founders',
    'Large addressable market',
    'Unique technology/IP',
    'Strong customer traction',
    'Proven business model',
    'Strategic partnerships',
    'Strong brand presence'
  ];

  const challengeOptions = [
    'Limited funding',
    'Market competition',
    'Customer acquisition cost',
    'Scaling challenges',
    'Regulatory hurdles',
    'Team building',
    'Product-market fit',
    'Revenue generation'
  ];

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/startups/my-data', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.startup) {
        const startup = response.data.startup;
        setFormData({
          startup_name: startup.name || '',
          description: startup.description || '',
          problem_solving: startup.problem_solving || '',
          target_audience: startup.target_audience || '',
          unique_value_proposition: startup.unique_value_proposition || '',
          business_model: startup.business_model || '',
          category: startup.category || 'Technology',
          location: startup.location || '',
          founded_year: startup.founded_year || new Date().getFullYear(),
          team_size: startup.team_size || '',
          funding_total: startup.funding?.total || '',
          funding_rounds: startup.funding?.rounds || '0',
          monthly_revenue: '0',
          user_growth_rate: '0.5',
          burn_rate: '0',
          market_size: '1000000',
          key_strengths: startup.key_strengths || [],
          main_challenges: startup.main_challenges || []
        });
        setIsEditMode(false);
      } else {
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setIsEditMode(true);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (e, field) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    setFormData(prev => ({
      ...prev,
      [field]: isChecked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/predictions/success', {
        startup_name: formData.startup_name,
        description: formData.description,
        problem_solving: formData.problem_solving,
        target_audience: formData.target_audience,
        unique_value_proposition: formData.unique_value_proposition,
        business_model: formData.business_model,
        category: formData.category,
        location: formData.location,
        founded_year: parseInt(formData.founded_year),
        team_size: parseInt(formData.team_size),
        funding_total: parseFloat(formData.funding_total),
        funding_rounds: parseInt(formData.funding_rounds),
        monthly_revenue: parseFloat(formData.monthly_revenue),
        user_growth_rate: parseFloat(formData.user_growth_rate),
        burn_rate: parseFloat(formData.burn_rate),
        market_size: parseFloat(formData.market_size),
        key_strengths: formData.key_strengths,
        main_challenges: formData.main_challenges
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPrediction(response.data);
      setIsEditMode(false);
      setStep(1); // Reset to step 1
    } catch (err) {
      setError('Error making prediction. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="prediction-container">
        <div className="loading-message">Loading your startup data...</div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
        <div className="step-number">1</div>
        <div className="step-label">Basic Info</div>
      </div>
      <div className="step-line" />
      <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
        <div className="step-number">2</div>
        <div className="step-label">About Startup</div>
      </div>
      <div className="step-line" />
      <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
        <div className="step-number">3</div>
        <div className="step-label">Team & Funding</div>
      </div>
      <div className="step-line" />
      <div className={`step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
        <div className="step-number">4</div>
        <div className="step-label">Strengths & Goals</div>
      </div>
    </div>
  );

  return (
    <div className="prediction-container">
      <h1>🚀 Startup Success Prediction</h1>
      <p className="subtitle">Tell us about your startup for personalized AI insights</p>

      {!isEditMode && formData.startup_name ? (
        <div className="existing-data-banner">
          <h3>📊 Your Startup: {formData.startup_name}</h3>
          <p>{formData.description}</p>
          <div className="banner-actions">
            <button onClick={() => setIsEditMode(true)} className="edit-banner-btn">
              ✏️ Edit Details
            </button>
            <button onClick={handleSubmit} disabled={loading} className="predict-banner-btn">
              {loading ? 'Analyzing...' : '🎯 Run Prediction'}
            </button>
          </div>
        </div>
      ) : null}

      {isEditMode && (
        <div className="content-wrapper">
          <form onSubmit={handleSubmit} className="prediction-form">
            {renderStepIndicator()}

            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="form-step">
                <h2>Step 1: Basic Information</h2>
                
                <div className="form-group">
                  <label>Startup Name *</label>
                  <input
                    type="text"
                    name="startup_name"
                    value={formData.startup_name}
                    onChange={handleChange}
                    placeholder="e.g., TechFlow AI"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
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
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., San Francisco, CA"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Founded Year *</label>
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

                <button type="button" onClick={nextStep} className="next-btn">
                  Next Step →
                </button>
              </div>
            )}

            {/* STEP 2: About Your Startup */}
            {step === 2 && (
              <div className="form-step">
                <h2>Step 2: About Your Startup</h2>
                
                <div className="form-group">
                  <label>Short Description (Elevator Pitch) *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your startup in 2-3 sentences. What do you do?"
                    rows="3"
                    required
                  />
                  <span className="hint">This helps AI understand your business better</span>
                </div>

                <div className="form-group">
                  <label>What Problem Are You Solving? *</label>
                  <textarea
                    name="problem_solving"
                    value={formData.problem_solving}
                    onChange={handleChange}
                    placeholder="Describe the main problem or pain point your startup addresses"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Who is Your Target Audience? *</label>
                  <textarea
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={handleChange}
                    placeholder="e.g., Small business owners, Enterprise companies, Individual consumers..."
                    rows="2"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>What Makes You Unique? (Value Proposition) *</label>
                  <textarea
                    name="unique_value_proposition"
                    value={formData.unique_value_proposition}
                    onChange={handleChange}
                    placeholder="What sets you apart from competitors? Your key differentiator?"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Business Model *</label>
                  <textarea
                    name="business_model"
                    value={formData.business_model}
                    onChange={handleChange}
                    placeholder="How do you make money? (e.g., SaaS subscription, Marketplace commission, Freemium...)"
                    rows="2"
                    required
                  />
                </div>

                <div className="button-group">
                  <button type="button" onClick={prevStep} className="prev-btn">
                    ← Previous
                  </button>
                  <button type="button" onClick={nextStep} className="next-btn">
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Team & Funding */}
            {step === 3 && (
              <div className="form-step">
                <h2>Step 3: Team & Funding</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Team Size *</label>
                    <input
                      type="number"
                      name="team_size"
                      value={formData.team_size}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Total Funding Raised (USD) *</label>
                    <input
                      type="number"
                      name="funding_total"
                      value={formData.funding_total}
                      onChange={handleChange}
                      placeholder="e.g., 500000"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Number of Funding Rounds *</label>
                  <input
                    type="number"
                    name="funding_rounds"
                    value={formData.funding_rounds}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                  <span className="hint">0 if bootstrapped, 1 for seed, 2+ for multiple rounds</span>
                </div>

                <div className="button-group">
                  <button type="button" onClick={prevStep} className="prev-btn">
                    ← Previous
                  </button>
                  <button type="button" onClick={nextStep} className="next-btn">
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Strengths & Challenges */}
            {step === 4 && (
              <div className="form-step">
                <h2>Step 4: Key Strengths & Challenges</h2>
                
                <div className="form-group">
                  <label>Select Your Key Strengths (Select multiple)</label>
                  <div className="checkbox-grid">
                    {strengthOptions.map(strength => (
                      <label key={strength} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={strength}
                          checked={formData.key_strengths.includes(strength)}
                          onChange={(e) => handleCheckboxChange(e, 'key_strengths')}
                        />
                        <span>{strength}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Select Your Main Challenges (Select multiple)</label>
                  <div className="checkbox-grid">
                    {challengeOptions.map(challenge => (
                      <label key={challenge} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={challenge}
                          checked={formData.main_challenges.includes(challenge)}
                          onChange={(e) => handleCheckboxChange(e, 'main_challenges')}
                        />
                        <span>{challenge}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="button-group">
                  <button type="button" onClick={prevStep} className="prev-btn">
                    ← Previous
                  </button>
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Analyzing...' : '🎯 Get AI Prediction'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      )}

      {prediction && (
        <div className="prediction-result">
          <h2>📊 Prediction Results</h2>
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
              <h3>💡 AI Recommendations</h3>
              <ul>
                {prediction.probability > 70 && (
                  <>
                    <li>✅ Strong potential for success - focus on scaling</li>
                    <li>✅ Consider approaching Series A investors</li>
                    <li>✅ Build strategic partnerships to accelerate growth</li>
                  </>
                )}
                {prediction.probability > 40 && prediction.probability <= 70 && (
                  <>
                    <li>⚡ Moderate potential - strengthen your fundamentals</li>
                    <li>⚡ Focus on user acquisition and retention metrics</li>
                    <li>⚡ Refine your business model and pricing strategy</li>
                  </>
                )}
                {prediction.probability <= 40 && (
                  <>
                    <li>⚠️ Consider pivoting or adjusting your strategy</li>
                    <li>⚠️ Focus heavily on market validation</li>
                    <li>⚠️ Build stronger team capabilities and expertise</li>
                  </>
                )}
              </ul>
            </div>

            <div className="next-steps-banner">
              <h3>🤖 Want Personalized Advice?</h3>
              <p>Now that we know your startup, ask our AI Advisor specific questions!</p>
              <a href="/advisor" className="advisor-cta-btn">
                Talk to AI Advisor →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessPrediction;
