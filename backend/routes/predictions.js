const router = require('express').Router();
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const Prediction = require('../models/Prediction');
const Startup = require('../models/Startup');

// Success prediction - SAVES ALL STARTUP DATA
router.post('/success', authenticateToken, async (req, res) => {
  try {
    const inputData = req.body;

    // SAVE OR UPDATE COMPLETE STARTUP DATA
    let startup = await Startup.findOne({ userId: req.user.id });
    
    const startupData = {
      name: inputData.startup_name,
      description: inputData.description,
      problem_solving: inputData.problem_solving,
      target_audience: inputData.target_audience,
      unique_value_proposition: inputData.unique_value_proposition,
      business_model: inputData.business_model,
      category: inputData.category,
      location: inputData.location,
      team_size: inputData.team_size,
      founded_year: inputData.founded_year,
      funding: {
        total: inputData.funding_total,
        rounds: inputData.funding_rounds
      },
      key_strengths: inputData.key_strengths || [],
      main_challenges: inputData.main_challenges || []
    };

    if (startup) {
      // UPDATE existing startup
      startup = await Startup.findOneAndUpdate(
        { userId: req.user.id },
        startupData,
        { new: true }
      );
      console.log('✓ Updated startup data for:', startup.name);
    } else {
      // CREATE new startup
      startup = await Startup.create({
        ...startupData,
        userId: req.user.id
      });
      console.log('✓ Created new startup:', startup.name);
    }

    let mlResponse;
    
    try {
      // Try calling ML service
      mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/predict/success`,
        inputData,
        { timeout: 5000 }
      );
      console.log('✓ Prediction using ML service');
    } catch (mlError) {
      console.log('ML service not available, using fallback calculation');
      
      // FALLBACK: Rule-based prediction
      const companyAge = 2025 - inputData.founded_year;
      let score = 0;
      
      if (inputData.funding_total > 5000000) score += 30;
      else if (inputData.funding_total > 1000000) score += 20;
      else if (inputData.funding_total > 100000) score += 10;
      
      if (inputData.team_size >= 5 && inputData.team_size <= 50) score += 20;
      if (companyAge >= 2 && companyAge <= 5) score += 20;
      if (inputData.funding_rounds >= 2 && inputData.funding_rounds <= 4) score += 15;
      
      const hotCategories = ['Technology', 'AI/ML', 'Fintech', 'SaaS'];
      if (hotCategories.includes(inputData.category)) score += 15;
      
      // Bonus for key strengths
      if (inputData.key_strengths && inputData.key_strengths.length > 0) {
        score += Math.min(inputData.key_strengths.length * 2, 10);
      }
      
      const probability = Math.min(score, 100);
      
      mlResponse = {
        data: {
          probability: probability,
          prediction: probability >= 50 ? 'Success' : 'Risk',
          confidence: probability >= 50 ? probability : (100 - probability),
          explanation: {
            funding_total: inputData.funding_total > 1000000 ? 0.25 : -0.10,
            team_size: (inputData.team_size >= 5 && inputData.team_size <= 50) ? 0.15 : -0.05,
            company_age: (companyAge >= 2 && companyAge <= 5) ? 0.20 : 0.05,
            funding_rounds: inputData.funding_rounds > 0 ? 0.12 : -0.08,
            category: hotCategories.includes(inputData.category) ? 0.18 : 0.08
          },
          processing_device: 'CPU (Fallback)'
        }
      };
    }

    // Save prediction
    const prediction = await Prediction.create({
      userId: req.user.id,
      type: 'success',
      input: inputData,
      result: mlResponse.data
    });

    // Link prediction to startup
    await Startup.findByIdAndUpdate(startup._id, {
      $push: { predictions: prediction._id }
    });

    res.json(mlResponse.data);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
