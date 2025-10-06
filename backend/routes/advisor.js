const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const Startup = require('../models/Startup');

// Knowledge base for startup advice
const knowledgeBase = {
  validation: {
    keywords: ['validate', 'idea', 'mvp', 'market fit', 'test'],
    advice: `**How to Validate Your Startup Idea**

✅ DO:
• Talk to 50-100 potential customers before building anything
• Create a landing page to measure interest (aim for 10%+ conversion)
• Build a simple prototype or mockup and get feedback
• Test your value proposition with real users
• Look for patterns in customer pain points

❌ DON'T:
• Don't spend months building without customer feedback
• Don't ask friends/family - they'll be too nice
• Don't validate only with surveys - observe actual behavior
• Don't assume you know what customers want

💡 PRO TIP: If people aren't willing to pay or give you their email, your idea needs work. Real validation = money or strong commitment.`
  },
  
  funding: {
    keywords: ['funding', 'raise', 'investor', 'venture capital', 'seed', 'series', 'money'],
    advice: `**When and How to Raise Funding**

✅ DO:
• Bootstrap as long as possible to maintain control
• Raise when you have clear traction (growing users/revenue)
• Know your metrics cold: CAC, LTV, churn, MRR
• Build relationships with investors 6 months before asking
• Have a clear plan for how you'll use the money

❌ DON'T:
• Don't raise too early - you'll dilute equity unnecessarily
• Don't approach investors without traction or a prototype
• Don't accept money from investors who don't understand your market
• Don't over-raise and waste money on unnecessary expenses

💡 PRO TIP: Best time to raise is when you don't need it. Aim for 18-24 months runway.`
  },
  
  mvp: {
    keywords: ['mvp', 'product', 'build', 'develop', 'prototype', 'launch', 'feature'],
    advice: `**Building Your Minimum Viable Product**

✅ DO:
• Build the smallest feature set that solves the core problem
• Launch in 4-8 weeks, not 6 months
• Get it in front of real users as soon as possible
• Use no-code tools if possible (Bubble, Webflow, etc.)
• Focus on ONE key feature that provides value

❌ DON'T:
• Don't build features "just in case"
• Don't aim for perfection - aim for learning
• Don't build in isolation - involve users constantly
• Don't over-engineer the first version

💡 PRO TIP: If you're not embarrassed by your first version, you launched too late. Ship fast, learn faster.`
  },
  
  team: {
    keywords: ['team', 'hire', 'cofounder', 'employee', 'talent', 'people', 'staff'],
    advice: `**Building Your Startup Team**

✅ DO:
• Look for complementary skills (tech + business + domain expert)
• Hire slowly, fire quickly if it's not working
• Give equity to early employees (0.5-2% for first 10)
• Build a strong culture from day one
• Hire for attitude and adaptability over experience

❌ DON'T:
• Don't hire friends unless they're truly qualified
• Don't hire too many people too fast
• Don't skip reference checks
• Don't delay firing underperformers

💡 PRO TIP: First 10 employees make or break your company. Take your time and get it right.`
  },
  
  marketing: {
    keywords: ['marketing', 'customers', 'growth', 'acquire', 'sales', 'traffic', 'user'],
    advice: `**Marketing and Customer Acquisition**

✅ DO:
• Start with one channel and master it before adding more
• Content marketing: Write about problems you solve
• Direct outreach: Personally reach out to first 100 customers
• Track everything: know your cost per acquisition
• Focus on retention before scaling acquisition

❌ DON'T:
• Don't try every marketing channel at once
• Don't spend on ads until you have product-market fit
• Don't ignore SEO in the beginning
• Don't forget email marketing - it still works

💡 PRO TIP: Best early channels: Personal network, LinkedIn, Product Hunt, relevant communities/forums.`
  },
  
  metrics: {
    keywords: ['metrics', 'kpi', 'track', 'measure', 'analytics', 'data'],
    advice: `**Key Metrics to Track**

✅ DO Track:
• Monthly Recurring Revenue (MRR)
• Customer Acquisition Cost (CAC)
• Lifetime Value (LTV)
• Churn Rate
• Daily/Monthly Active Users
• Burn Rate and Runway

❌ DON'T:
• Don't track vanity metrics (social media followers)
• Don't obsess over metrics before you have users
• Don't ignore unit economics

💡 PRO TIP: Rule of thumb - LTV should be 3x CAC, and CAC payback should be under 12 months.`
  },
  
  pricing: {
    keywords: ['price', 'pricing', 'charge', 'cost', 'monetize', 'revenue'],
    advice: `**Pricing Your Product**

✅ DO:
• Charge from day one - even if it's low
• Price based on value delivered, not cost
• Test different price points with A/B testing
• Offer annual plans (with discount) for better cash flow
• Have at least 3 tiers: Basic, Pro, Enterprise

❌ DON'T:
• Don't undercharge - it signals low value
• Don't compete only on price
• Don't be afraid to increase prices
• Don't make pricing too complex

💡 PRO TIP: If 80% of customers accept your price without negotiation, you're probably too cheap. Aim for 40-60% acceptance.`
  },
  
  competition: {
    keywords: ['competition', 'competitor', 'compete', 'rival', 'market'],
    advice: `**Handling Competition**

✅ DO:
• Focus on what makes you different, not better
• Study competitors but don't copy them
• Find underserved niches they're ignoring
• Build relationships with customers they're frustrating
• Move faster and be more customer-focused

❌ DON'T:
• Don't obsess over what competitors are doing
• Don't engage in price wars
• Don't bad-mouth competitors
• Don't ignore new entrants

💡 PRO TIP: Competition validates your market. No competition might mean no market.`
  },
  
  legal: {
    keywords: ['legal', 'incorporate', 'contract', 'trademark', 'patent', 'law'],
    advice: `**Legal Basics for Startups**

✅ DO:
• Incorporate early (Delaware C-Corp for US startups)
• Get founder agreements in writing from day one
• Set up proper equity vesting (4 year, 1 year cliff)
• Protect your IP with NDAs and assignments
• Get a good startup lawyer (not your uncle)

❌ DON'T:
• Don't use online templates for complex agreements
• Don't skip founder vesting
• Don't ignore tax obligations
• Don't share equity without proper documentation

💡 PRO TIP: Legal issues are expensive to fix later. Invest $2-5K upfront to do it right.`
  },
  
  pivot: {
    keywords: ['pivot', 'change', 'direction', 'fail', 'not working', 'switch'],
    advice: `**When and How to Pivot**

✅ DO:
• Pivot when data clearly shows no traction after 6-12 months
• Keep talking to customers to understand why
• Make small pivots first, not complete overhauls
• Leverage what you've learned
• Be honest with team and investors

❌ DON'T:
• Don't pivot every few weeks
• Don't give up too early (6 months minimum)
• Don't ignore what's working while pivoting
• Don't pivot without customer insights

💡 PRO TIP: Most successful startups pivot 1-3 times before finding product-market fit.`
  }
};

// Find best matching advice WITH YOUR STARTUP CONTEXT
async function findAdviceWithContext(question, userId) {
  const lowerQuestion = question.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;

  // GET YOUR STARTUP DATA FROM DATABASE
  const startup = await Startup.findOne({ userId }).sort({ createdAt: -1 });
  
  for (const [category, data] of Object.entries(knowledgeBase)) {
    const score = data.keywords.filter(kw => lowerQuestion.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      bestMatch = data.advice;
    }
  }

  let advice = bestMatch || getGeneralAdvice();
  
  // ADD PERSONALIZED CONTEXT BASED ON YOUR STARTUP DATA
  if (startup) {
    const companyAge = new Date().getFullYear() - (startup.founded_year || new Date().getFullYear());
    const fundingStatus = startup.funding?.total > 0 ? `$${startup.funding.total.toLocaleString()}` : 'Not raised yet';
    
    let personalizedPrefix = `\n\n**📊 YOUR STARTUP PROFILE:**\n`;
    personalizedPrefix += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    personalizedPrefix += `• **Name:** ${startup.name}\n`;
    personalizedPrefix += `• **Category:** ${startup.category || 'Not specified'}\n`;
    personalizedPrefix += `• **Location:** ${startup.location || 'Not specified'}\n`;
    personalizedPrefix += `• **Team Size:** ${startup.team_size || 'Not specified'} people\n`;
    personalizedPrefix += `• **Total Funding:** ${fundingStatus}\n`;
    personalizedPrefix += `• **Funding Rounds:** ${startup.funding?.rounds || 0}\n`;
    personalizedPrefix += `• **Company Age:** ${companyAge} year${companyAge !== 1 ? 's' : ''}\n`;
    personalizedPrefix += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // ADD SPECIFIC RECOMMENDATIONS BASED ON YOUR DATA
    personalizedPrefix += `**🎯 PERSONALIZED ADVICE FOR ${startup.name.toUpperCase()}:**\n\n`;
    
    if (startup.team_size < 5) {
      personalizedPrefix += `⚠️ **Small Team Alert:** With ${startup.team_size} people, focus on:\n`;
      personalizedPrefix += `   • Finding 1-2 key hires to fill critical skill gaps\n`;
      personalizedPrefix += `   • Automating or outsourcing non-core tasks\n`;
      personalizedPrefix += `   • Building strategic partnerships to extend capabilities\n\n`;
    } else if (startup.team_size > 50) {
      personalizedPrefix += `📈 **Scaling Stage:** With ${startup.team_size} people, focus on:\n`;
      personalizedPrefix += `   • Building strong middle management\n`;
      personalizedPrefix += `   • Implementing processes and documentation\n`;
      personalizedPrefix += `   • Maintaining culture while growing\n\n`;
    }
    
    if (!startup.funding || startup.funding.total === 0) {
      personalizedPrefix += `💰 **Pre-Funding Stage:** You haven't raised external funding yet:\n`;
      personalizedPrefix += `   • Focus on getting to $10K MRR before approaching investors\n`;
      personalizedPrefix += `   • Bootstrap as long as possible to maintain control\n`;
      personalizedPrefix += `   • Build strong unit economics and traction metrics\n\n`;
    } else if (startup.funding.total < 500000) {
      personalizedPrefix += `💰 **Seed Stage:** With $${startup.funding.total.toLocaleString()} raised:\n`;
      personalizedPrefix += `   • Focus on achieving product-market fit\n`;
      personalizedPrefix += `   • Aim for 18-24 months runway\n`;
      personalizedPrefix += `   • Prepare metrics for Series A (if applicable)\n\n`;
    } else if (startup.funding.total >= 500000 && startup.funding.total < 5000000) {
      personalizedPrefix += `💰 **Series A Stage:** With $${startup.funding.total.toLocaleString()} raised:\n`;
      personalizedPrefix += `   • Focus on scaling what's working\n`;
      personalizedPrefix += `   • Build repeatable sales/marketing processes\n`;
      personalizedPrefix += `   • Optimize unit economics before next raise\n\n`;
    }
    
    if (companyAge < 1) {
      personalizedPrefix += `🚀 **Early Stage:** As a new startup (< 1 year):\n`;
      personalizedPrefix += `   • Prioritize customer discovery and validation\n`;
      personalizedPrefix += `   • Talk to 100+ potential customers\n`;
      personalizedPrefix += `   • Launch MVP in next 4-8 weeks if you haven't\n\n`;
    } else if (companyAge >= 1 && companyAge < 3) {
      personalizedPrefix += `📊 **Growth Stage:** At ${companyAge} years old:\n`;
      personalizedPrefix += `   • Focus on finding your growth engine\n`;
      personalizedPrefix += `   • Double down on channels that work\n`;
      personalizedPrefix += `   • Start thinking about scalability\n\n`;
    } else if (companyAge >= 3) {
      personalizedPrefix += `🎯 **Mature Stage:** At ${companyAge} years old:\n`;
      personalizedPrefix += `   • Should have clear revenue and growth metrics\n`;
      personalizedPrefix += `   • Focus on operational excellence\n`;
      personalizedPrefix += `   • Consider expansion or exit strategies\n\n`;
    }
    
    // Industry-specific advice
    const industryAdvice = {
      'Technology': 'In tech, focus on building defensible IP and network effects',
      'SaaS': 'For SaaS, prioritize MRR growth, low churn (<5%), and high NPS',
      'E-commerce': 'In e-commerce, focus on CAC:LTV ratio and repeat purchase rate',
      'Fintech': 'In fintech, regulatory compliance and trust-building are critical',
      'Healthcare': 'In healthcare, prioritize clinical validation and regulatory pathways',
      'AI/ML': 'In AI/ML, focus on data moats and demonstrable ROI for customers'
    };
    
    if (startup.category && industryAdvice[startup.category]) {
      personalizedPrefix += `🏭 **Industry-Specific:** ${industryAdvice[startup.category]}\n\n`;
    }
    
    personalizedPrefix += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    advice = personalizedPrefix + advice;
  } else {
    // NO STARTUP DATA YET
    let noDataPrefix = `\n\n⚠️ **NO STARTUP DATA FOUND**\n\n`;
    noDataPrefix += `I can give you better personalized advice if you:\n`;
    noDataPrefix += `1. Go to **Success Prediction** page\n`;
    noDataPrefix += `2. Fill in your startup details\n`;
    noDataPrefix += `3. Come back here for customized advice!\n\n`;
    noDataPrefix += `For now, here's general advice:\n\n`;
    noDataPrefix += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    advice = noDataPrefix + advice;
  }

  return advice;
}

function getGeneralAdvice() {
  return `**General Startup Advice**

✅ KEY PRINCIPLES:
• Talk to customers obsessively
• Build something people actually want
• Launch fast, iterate faster
• Focus on one thing and do it well
• Measure everything that matters

❌ COMMON MISTAKES:
• Building in isolation
• Scaling too early
• Ignoring unit economics
• Hiring too fast
• Trying to do everything

💡 PRO TIP: Ask me specific questions about: validation, funding, MVP, team building, marketing, metrics, pricing, competition, or legal matters.

**Try asking:**
• "How do I validate my startup idea?"
• "When should I raise funding?"
• "How do I build an MVP?"
• "What metrics should I track?"`;
}

// AI Advisor endpoint - USES YOUR EXISTING STARTUP DATA
router.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Find matching advice WITH YOUR STARTUP CONTEXT
    const answer = await findAdviceWithContext(question, req.user.id);

    res.json({
      answer,
      timestamp: new Date(),
      source: 'Personalized AI Advisor'
    });

  } catch (error) {
    console.error('Advisor error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get YOUR startup info
router.get('/my-startup', authenticateToken, async (req, res) => {
  try {
    const startup = await Startup.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    
    if (!startup) {
      return res.json({ 
        hasStartup: false,
        message: 'Add your startup details in the Success Prediction page first'
      });
    }

    res.json({
      hasStartup: true,
      startup: {
        name: startup.name,
        category: startup.category,
        location: startup.location,
        team_size: startup.team_size,
        funding: startup.funding,
        founded_year: startup.founded_year
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get suggested questions
router.get('/suggestions', authenticateToken, (req, res) => {
  const suggestions = [
    "How do I validate my startup idea?",
    "What should I focus on in the first 6 months?",
    "When should I raise my first funding round?",
    "How do I build a minimum viable product (MVP)?",
    "What metrics should I track as an early-stage startup?",
    "How do I price my product?",
    "What's the best way to acquire initial customers?",
    "Should I bootstrap or seek venture capital?",
    "How do I pitch to investors effectively?",
    "How do I hire my first employees?",
    "What marketing strategies work for startups?",
    "How do I handle competition?",
    "When should I consider pivoting?"
  ];

  res.json({ suggestions: suggestions.sort(() => 0.5 - Math.random()).slice(0, 5) });
});

// Clear conversation
router.post('/clear', authenticateToken, (req, res) => {
  res.json({ message: 'Ready for new questions' });
});

module.exports = router;
