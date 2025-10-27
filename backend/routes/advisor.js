const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const Startup = require('../models/Startup');
const axios = require('axios');

// Dynamic AI advisor powered by ML service
router.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log(`[ADVISOR] User ${req.user.id} asked: "${question}"`);

    // Get user's startup data from database
    const startup = await Startup.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    
    console.log(`[ADVISOR] Startup data found: ${startup ? 'YES' : 'NO'}`);

    // Call ML service for dynamic AI response
    try {
      const mlResponse = await axios.post(
        'http://localhost:8000/advisor/ask',
        {
          question: question,
          startup_data: startup ? {
            name: startup.name,
            description: startup.description,
            category: startup.category,
            location: startup.location,
            team_size: startup.team_size,
            founded_year: startup.founded_year,
            funding: startup.funding,
            problem_solving: startup.problem_solving,
            target_audience: startup.target_audience,
            unique_value_proposition: startup.unique_value_proposition,
            business_model: startup.business_model,
            key_strengths: startup.key_strengths,
            main_challenges: startup.main_challenges
          } : null
        },
        { 
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[ADVISOR] ML service responded successfully`);
      console.log(`[ADVISOR] Response length: ${mlResponse.data.answer.length} characters`);

      res.json({
        answer: mlResponse.data.answer,
        confidence: mlResponse.data.confidence,
        insights: mlResponse.data.insights,
        recommendations: mlResponse.data.recommendations,
        timestamp: new Date(),
        source: mlResponse.data.source,
        characterCount: mlResponse.data.answer.length,
        wordCount: mlResponse.data.answer.split(/\s+/).length
      });

    } catch (mlError) {
      console.error('[ADVISOR] ML service error:', mlError.message);
      
      // Detailed error logging
      if (mlError.response) {
        console.error('[ADVISOR] ML service returned error:', mlError.response.status);
        console.error('[ADVISOR] Error details:', mlError.response.data);
      } else if (mlError.request) {
        console.error('[ADVISOR] ML service not responding - is it running?');
      }
      
      // Fallback response with helpful message
      const fallbackMessage = `I apologize, but I'm having trouble generating a response right now.\n\n` +
        `**Troubleshooting Steps:**\n\n` +
        `1. **Check ML Service:** Ensure it's running on port 8000\n` +
        `   \`\`\`\n   cd ml-service\n   python main_gpu.py\n   \`\`\`\n\n` +
        `2. **Fill Startup Data:** Go to Success Prediction page and complete your profile\n\n` +
        `3. **Try Again:** Ask a specific question like:\n` +
        `   - "What should I focus on this month?"\n` +
        `   - "Should I raise funding now?"\n` +
        `   - "What are my startup's pros and cons?"\n\n` +
        `**Error Details:** ${mlError.message}`;
      
      res.json({
        answer: fallbackMessage,
        confidence: 0,
        insights: ['ML service unavailable'],
        recommendations: ['Start ML service on port 8000'],
        timestamp: new Date(),
        source: "Fallback (ML service offline)",
        error: true
      });
    }

  } catch (error) {
    console.error('[ADVISOR] Backend error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Internal server error in advisor route'
    });
  }
});

// Get suggested questions
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    // Check if user has startup data
    const startup = await Startup.findOne({ userId: req.user.id });
    
    let suggestions = [];
    
    if (startup) {
      // Personalized suggestions based on their data
      suggestions = [
        "What are my startup's pros and cons?",
        "What should I focus on this month?",
        "Should I raise funding or bootstrap?",
        "Am I ready for Series A fundraising?",
        "What's my biggest risk right now?",
        "How can I improve my success probability?"
      ];
    } else {
      // General suggestions if no data
      suggestions = [
        "How do I validate my startup idea?",
        "What metrics should I track?",
        "How do I get my first 10 customers?",
        "When should I raise funding?",
        "How do I build an MVP?",
        "What makes a successful startup?"
      ];
    }
    
    res.json({ suggestions });
  } catch (error) {
    console.error('[ADVISOR] Error loading suggestions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's startup info (for frontend display)
router.get('/my-startup', authenticateToken, async (req, res) => {
  try {
    const startup = await Startup.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    
    if (!startup) {
      return res.json({ 
        hasStartup: false,
        message: 'Complete your startup profile in Success Prediction page for personalized advice'
      });
    }

    res.json({
      hasStartup: true,
      startup: {
        name: startup.name,
        category: startup.category,
        team_size: startup.team_size,
        funding_total: startup.funding?.total || 0,
        founded_year: startup.founded_year
      }
    });
  } catch (error) {
    console.error('[ADVISOR] Error fetching startup:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear conversation (optional - for chat history management)
router.post('/clear', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Conversation cleared',
    timestamp: new Date()
  });
});

module.exports = router;
