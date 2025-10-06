const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');

// Match investors
router.post('/match', authenticateToken, async (req, res) => {
  try {
    const { startup } = req.body;

    // Mock investor database
    const allInvestors = [
      {
        name: "Sequoia Capital",
        focus: ["Technology", "SaaS", "AI/ML"],
        stage: "Series A-C",
        reason: "Strong track record in tech sector"
      },
      {
        name: "Andreessen Horowitz",
        focus: ["AI/ML", "Fintech", "Technology"],
        stage: "Seed-Series B",
        reason: "Active in AI/ML investments"
      },
      {
        name: "Y Combinator",
        focus: ["All sectors"],
        stage: "Pre-seed-Seed",
        reason: "Best for early-stage startups"
      },
      {
        name: "Accel Partners",
        focus: ["SaaS", "E-commerce"],
        stage: "Series A-B",
        reason: "Focus on SaaS business models"
      },
      {
        name: "500 Startups",
        focus: ["All sectors"],
        stage: "Pre-seed-Seed",
        reason: "Global accelerator program"
      },
      {
        name: "Khosla Ventures",
        focus: ["Healthcare", "AI/ML", "Technology"],
        stage: "Seed-Series B",
        reason: "Deep tech and healthcare focus"
      }
    ];

    // Calculate match scores
    const matchedInvestors = allInvestors.map(investor => {
      let score = 50;

      // Category match
      if (investor.focus.includes(startup.category) || investor.focus.includes("All sectors")) {
        score += 30;
      }

      // Funding stage match
      const fundingAmount = startup.funding?.total || 0;
      if (fundingAmount === 0 && investor.stage.includes("Seed")) {
        score += 20;
      } else if (fundingAmount > 0 && fundingAmount < 1000000 && investor.stage.includes("Series A")) {
        score += 20;
      }

      return {
        ...investor,
        match_score: Math.min(score, 95)
      };
    });

    // Sort by match score
    matchedInvestors.sort((a, b) => b.match_score - a.match_score);

    res.json({
      investors: matchedInvestors.slice(0, 6)
    });

  } catch (error) {
    console.error('Investor matching error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
