const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const Startup = require('../models/Startup');

// Analyze pitch WITH YOUR STARTUP CONTEXT
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { pitch_text } = req.body;

    if (!pitch_text || pitch_text.trim().length < 50) {
      return res.status(400).json({ error: 'Pitch must be at least 50 characters' });
    }

    // GET YOUR STARTUP DATA
    const startup = await Startup.findOne({ userId: req.user.id });

    // Simple rule-based analysis
    const wordCount = pitch_text.split(/\s+/).length;
    const hasNumbers = /\d/.test(pitch_text);
    const hasProblem = /(problem|challenge|issue|pain)/i.test(pitch_text);
    const hasSolution = /(solution|solve|fix|help|platform)/i.test(pitch_text);
    const hasMarket = /(market|customers|users|target)/i.test(pitch_text);
    const hasMetrics = /(\$|%|million|thousand|billion)/i.test(pitch_text);

    // Check if pitch mentions their startup
    let mentionsOwnStartup = false;
    if (startup) {
      mentionsOwnStartup = new RegExp(startup.name, 'i').test(pitch_text);
    }

    // Calculate scores
    let clarity = 50;
    if (wordCount >= 50 && wordCount <= 150) clarity += 30;
    if (hasProblem && hasSolution) clarity += 20;

    let completeness = 40;
    if (hasProblem) completeness += 15;
    if (hasSolution) completeness += 15;
    if (hasMarket) completeness += 15;
    if (hasMetrics) completeness += 15;

    let persuasiveness = 50;
    if (hasNumbers) persuasiveness += 20;
    if (hasMetrics) persuasiveness += 20;
    if (wordCount > 100) persuasiveness += 10;

    const overall_score = Math.round((clarity + completeness + persuasiveness) / 3);

    // Generate feedback WITH YOUR STARTUP CONTEXT
    const strengths = [];
    const improvements = [];

    if (hasProblem) strengths.push("Clear problem statement");
    if (hasSolution) strengths.push("Solution is well explained");
    if (hasMetrics) strengths.push("Includes specific numbers/metrics");
    if (hasMarket) strengths.push("Mentions target market");
    if (mentionsOwnStartup && startup) {
      strengths.push(`Good use of your startup name: ${startup.name}`);
    }

    if (!hasProblem) improvements.push("Add a clear problem statement");
    if (!hasSolution) improvements.push("Explain your solution more clearly");
    if (!hasMetrics) improvements.push("Include specific metrics or traction");
    if (!hasMarket) improvements.push("Mention your target market size");
    if (wordCount < 75) improvements.push("Expand your pitch with more details");
    if (wordCount > 200) improvements.push("Make it more concise (aim for 100-150 words)");

    // ADD PERSONALIZED ADVICE BASED ON YOUR STARTUP
    if (startup) {
      if (startup.funding.total > 0) {
        improvements.push(`Mention your $${startup.funding.total.toLocaleString()} funding in the pitch`);
      }
      if (startup.team_size > 10) {
        improvements.push(`Highlight your ${startup.team_size}-person team as a strength`);
      }
      if (startup.category) {
        improvements.push(`Emphasize your ${startup.category} sector expertise`);
      }
    }

    const sentiment = overall_score >= 70 ? "Positive" : overall_score >= 50 ? "Neutral" : "Needs Work";

    res.json({
      overall_score,
      clarity,
      completeness,
      persuasiveness,
      strengths: strengths.length > 0 ? strengths : ["Keep working on it!"],
      improvements: improvements.length > 0 ? improvements.slice(0, 6) : ["Looks good overall!"],
      sentiment,
      startup_context: startup ? {
        name: startup.name,
        category: startup.category,
        mentioned: mentionsOwnStartup
      } : null
    });

  } catch (error) {
    console.error('Pitch analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
