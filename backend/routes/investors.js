const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const Startup = require('../models/Startup');

// Real investor data
const INVESTORS = [
  {
    name: 'Sequoia Capital',
    logo: '🌲',
    type: 'Venture Capital',
    stage: 'Seed-Series B',
    ticketSize: '$1M - $20M',
    location: 'Menlo Park, USA',
    portfolio: 200,
    focus: ['Technology', 'AI/ML', 'Fintech', 'E-commerce'],
    description: 'Leading VC firm backing legendary founders. Portfolio includes Apple, Google, Airbnb, Stripe.',
    whyMatch: 'Active in AI/ML investments. Perfect match for Technology startups. Great for seed-stage funding'
  },
  {
    name: 'Andreessen Horowitz (a16z)',
    logo: '🅰️',
    type: 'Venture Capital',
    stage: 'Seed-Series B',
    ticketSize: '$1M - $20M',
    location: 'Menlo Park, USA',
    portfolio: 150,
    focus: ['AI/ML', 'Fintech', 'Technology'],
    description: 'Deep tech and enterprise focus. Portfolio includes Coinbase, Instagram, Lyft, Oculus.',
    whyMatch: 'Active in AI/ML investments. Perfect match for Technology startups. Great for seed-stage funding'
  },
  {
    name: 'Y Combinator',
    logo: '🚀',
    type: 'Accelerator',
    stage: 'Pre-seed-Seed',
    ticketSize: '$150K - $500K',
    location: 'San Francisco, USA',
    portfolio: 4000,
    focus: ['All sectors'],
    description: 'World\'s most successful startup accelerator. Portfolio includes Airbnb, DoorDash, Stripe, Dropbox.',
    whyMatch: 'Best for early-stage startups. Great for seed-stage funding. Provides mentorship and network'
  },
  {
    name: 'Accel Partners',
    logo: '⚡',
    type: 'Venture Capital',
    stage: 'Seed-Series C',
    ticketSize: '$2M - $15M',
    location: 'Palo Alto, USA',
    portfolio: 100,
    focus: ['SaaS', 'Technology', 'Consumer'],
    description: 'Early-stage investor with deep SaaS expertise. Portfolio includes Facebook, Slack, Dropbox.',
    whyMatch: 'European and US investments. Perfect for SaaS and Technology. Good for Series A'
  },
  {
    name: '500 Global',
    logo: '🌐',
    type: 'Accelerator',
    stage: 'Pre-seed-Seed',
    ticketSize: '$50K - $250K',
    location: 'San Francisco, USA',
    portfolio: 2500,
    focus: ['All sectors', 'Global'],
    description: 'Global VC and accelerator backing innovative startups worldwide. 2,500+ company portfolio.',
    whyMatch: 'Great for early-stage startups. Global focus. Provides hands-on support'
  },
  {
    name: 'Khosla Ventures',
    logo: '💡',
    type: 'Venture Capital',
    stage: 'Seed-Series B',
    ticketSize: '$2M - $15M',
    location: 'Menlo Park, USA',
    portfolio: 80,
    focus: ['AI/ML', 'Healthcare', 'Fintech'],
    description: 'High-conviction, founder-friendly VC focused on transformative technologies and businesses.',
    whyMatch: 'Deep tech and healthcare focus. Perfect match for AI/ML. Founder-friendly terms'
  },
  {
    name: 'Insight Partners',
    logo: '📊',
    type: 'Venture Capital',
    stage: 'Series A-Series C',
    ticketSize: '$5M - $50M',
    location: 'New York, USA',
    portfolio: 400,
    focus: ['SaaS', 'Enterprise', 'Technology'],
    description: 'Growth-stage investor focused on ScaleUp software companies. $90B+ assets under management.',
    whyMatch: 'Perfect for growth-stage SaaS. Enterprise focus. Strong operational support'
  },
  {
    name: 'Index Ventures',
    logo: '📇',
    type: 'Venture Capital',
    stage: 'Seed-Series C',
    ticketSize: '$1M - $50M',
    location: 'London, UK',
    portfolio: 200,
    focus: ['Technology', 'Fintech', 'E-commerce'],
    description: 'European and US early-stage investor. Portfolio includes Dropbox, Figma, Discord, Revolut.',
    whyMatch: 'European and US investments. Perfect for Technology and Fintech. Good for international expansion'
  }
];

// Calculate match score based on startup profile
function calculateMatchScore(startup, investor) {
  let score = 50; // Base score
  
  console.log(`[MATCH] Calculating for ${investor.name}`);
  console.log(`[MATCH] Startup: ${startup.name}, Category: ${startup.category}, Funding: ${startup.funding?.total || 0}`);
  
  // Category match (20 points)
  const startupCategory = (startup.category || '').toLowerCase();
  const investorFocus = investor.focus.map(f => f.toLowerCase());
  
  if (investorFocus.some(f => f.includes(startupCategory) || startupCategory.includes(f))) {
    score += 20;
    console.log(`[MATCH] Category match: +20 (${startup.category} matches ${investor.focus})`);
  } else if (investorFocus.includes('all sectors')) {
    score += 15;
    console.log(`[MATCH] All sectors: +15`);
  }
  
  // Stage match (20 points)
  const funding = startup.funding?.total || 0;
  const stage = investor.stage.toLowerCase();
  
  if (funding === 0 && (stage.includes('pre-seed') || stage.includes('accelerator'))) {
    score += 20;
    console.log(`[MATCH] Pre-seed/Accelerator match: +20`);
  } else if (funding < 1000000 && stage.includes('seed')) {
    score += 20;
    console.log(`[MATCH] Seed stage match: +20`);
  } else if (funding >= 1000000 && funding < 5000000 && stage.includes('series a')) {
    score += 20;
    console.log(`[MATCH] Series A match: +20`);
  } else if (funding >= 5000000 && (stage.includes('series b') || stage.includes('series c'))) {
    score += 20;
    console.log(`[MATCH] Series B/C match: +20`);
  } else {
    score += 5; // Partial match
    console.log(`[MATCH] Partial stage match: +5`);
  }
  
  // Team size match (10 points)
  const teamSize = startup.team_size || 0;
  if (teamSize >= 5 && teamSize <= 50) {
    score += 10;
    console.log(`[MATCH] Optimal team size: +10`);
  } else if (teamSize < 5 && investor.type === 'Accelerator') {
    score += 10;
    console.log(`[MATCH] Small team + Accelerator: +10`);
  } else {
    score += 5;
    console.log(`[MATCH] Team size partial: +5`);
  }
  
  // Location match (10 points)
  const location = (startup.location || '').toLowerCase();
  if (location.includes('us') || location.includes('san francisco') || location.includes('new york')) {
    score += 10;
    console.log(`[MATCH] US location: +10`);
  }
  
  // Company age match (10 points)
  const currentYear = new Date().getFullYear();
  const age = currentYear - (startup.founded_year || currentYear);
  if (age >= 1 && age <= 3) {
    score += 10;
    console.log(`[MATCH] Optimal age (1-3 years): +10`);
  } else if (age >= 0 && age <= 5) {
    score += 5;
    console.log(`[MATCH] Good age (0-5 years): +5`);
  }
  
  const finalScore = Math.min(Math.max(score, 0), 100);
  console.log(`[MATCH] Final score for ${investor.name}: ${finalScore}`);
  
  return finalScore;
}

// GET /api/investors/matches - Get matched investors
router.get('/matches', authenticateToken, async (req, res) => {
  try {
    console.log('\n[INVESTORS] ========================================');
    console.log('[INVESTORS] Request from User ID:', req.user.id);
    console.log('[INVESTORS] Token:', req.headers.authorization?.substring(0, 50) + '...');
    
    // Find the most recent startup data for this user
    const startup = await Startup.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Get most recent
      .lean(); // Convert to plain JS object for better performance
    
    console.log('[INVESTORS] Startup query result:', !!startup);
    
    if (!startup) {
      console.log('[INVESTORS] ❌ No startup data found for user');
      console.log('[INVESTORS] User needs to complete Success Prediction page first');
      return res.json({
        investors: [],
        startupProfile: null,
        message: 'Please complete your startup profile in Success Prediction page first'
      });
    }
    
    console.log('[INVESTORS] ✅ Startup data found:');
    console.log('[INVESTORS]   - Name:', startup.name);
    console.log('[INVESTORS]   - Category:', startup.category);
    console.log('[INVESTORS]   - Team Size:', startup.team_size);
    console.log('[INVESTORS]   - Funding:', startup.funding?.total || 0);
    console.log('[INVESTORS]   - Founded:', startup.founded_year);
    console.log('[INVESTORS]   - Location:', startup.location);
    
    // Calculate match scores for all investors
    const matchedInvestors = INVESTORS.map(investor => {
      const matchScore = calculateMatchScore(startup, investor);
      return {
        ...investor,
        matchScore: matchScore
      };
    });
    
    // Sort by match score (highest first)
    matchedInvestors.sort((a, b) => b.matchScore - a.matchScore);
    
    console.log('\n[INVESTORS] Match Scores:');
    matchedInvestors.forEach(inv => {
      console.log(`[INVESTORS]   ${inv.name}: ${inv.matchScore}%`);
    });
    
    console.log('\n[INVESTORS] ✅ Returning', matchedInvestors.length, 'investors');
    console.log('[INVESTORS] ========================================\n');
    
    res.json({
      investors: matchedInvestors,
      startupProfile: {
        name: startup.name,
        category: startup.category,
        location: startup.location,
        team_size: startup.team_size,
        funding: startup.funding,
        founded_year: startup.founded_year
      }
    });
    
  } catch (error) {
    console.error('[INVESTORS] ❌ ERROR:', error);
    console.error('[INVESTORS] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch investor matches',
      details: error.message 
    });
  }
});

// GET /api/investors/all - Get all investors (no matching needed)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    console.log('[INVESTORS] Fetching all investors (no matching)');
    res.json({
      investors: INVESTORS.map(inv => ({...inv, matchScore: 0})),
      count: INVESTORS.length
    });
  } catch (error) {
    console.error('[INVESTORS] Error:', error);
    res.status(500).json({ error: 'Failed to fetch investors' });
  }
});

// Debug route - check startup data
router.get('/debug/my-startup', authenticateToken, async (req, res) => {
  try {
    const allStartups = await Startup.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    res.json({
      userId: req.user.id,
      count: allStartups.length,
      latest: allStartups[0] || null,
      all: allStartups.map(s => ({
        id: s._id,
        name: s.name,
        category: s.category,
        team_size: s.team_size,
        funding: s.funding,
        created: s.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
