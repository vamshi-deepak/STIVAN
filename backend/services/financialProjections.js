// ==========================================
// FINANCIAL PROJECTION DASHBOARD
// ==========================================
// Auto-generate professional financial projections

/**
 * Generate comprehensive financial projections
 */
const generateFinancialProjections = (ideaData) => {
  try {
    const { marketSize, teamStrength, traction, description = '' } = ideaData;
    
    // Determine business model
    const businessModel = detectBusinessModel(description);
    
    // Calculate startup costs
    const startupCosts = calculateStartupCosts(businessModel, teamStrength);
    
    // Calculate monthly burn rate
    const monthlyBurnRate = calculateMonthlyBurnRate(startupCosts, teamStrength);
    
    // Generate 3-year revenue projections
    const revenueProjections = generateRevenueProjections(
      businessModel, 
      marketSize, 
      traction
    );
    
    // Calculate break-even
    const breakEven = calculateBreakEven(
      revenueProjections, 
      monthlyBurnRate
    );
    
    // Calculate ROI timeline
    const roiTimeline = calculateROITimeline(
      startupCosts, 
      revenueProjections
    );
    
    // Funding requirements
    const fundingRequirements = calculateFundingRequirements(
      startupCosts,
      monthlyBurnRate,
      breakEven
    );
    
    return {
      businessModel,
      startupCosts,
      monthlyBurnRate,
      revenueProjections,
      breakEven,
      roiTimeline,
      fundingRequirements,
      profitabilityScore: calculateProfitabilityScore(revenueProjections, monthlyBurnRate)
    };
    
  } catch (error) {
    console.error('Financial projection error:', error);
    return null;
  }
};

/**
 * Detect business model from description
 */
function detectBusinessModel(description) {
  const text = description.toLowerCase();
  
  if (text.includes('saas') || text.includes('subscription')) {
    return {
      type: 'SaaS',
      revenueModel: 'Monthly Recurring Revenue (MRR)',
      avgCustomerValue: 500,
      churnRate: 5
    };
  }
  
  if (text.includes('marketplace') || text.includes('platform')) {
    return {
      type: 'Marketplace',
      revenueModel: 'Transaction Fees',
      avgCustomerValue: 50,
      churnRate: 10
    };
  }
  
  if (text.includes('ecommerce') || text.includes('e-commerce')) {
    return {
      type: 'E-Commerce',
      revenueModel: 'Product Sales',
      avgCustomerValue: 100,
      churnRate: 20
    };
  }
  
  if (text.includes('consulting') || text.includes('service')) {
    return {
      type: 'Service',
      revenueModel: 'Hourly/Project Fees',
      avgCustomerValue: 5000,
      churnRate: 15
    };
  }
  
  // Default to SaaS
  return {
    type: 'SaaS',
    revenueModel: 'Subscription',
    avgCustomerValue: 500,
    churnRate: 5
  };
}

/**
 * Calculate startup costs breakdown
 */
function calculateStartupCosts(businessModel, teamStrength) {
  const costs = {
    development: 0,
    marketing: 0,
    legal: 0,
    infrastructure: 0,
    operations: 0,
    contingency: 0
  };
  
  // Development costs based on complexity
  if (businessModel.type === 'SaaS') {
    costs.development = 50000;
  } else if (businessModel.type === 'Marketplace') {
    costs.development = 100000;
  } else if (businessModel.type === 'E-Commerce') {
    costs.development = 30000;
  } else {
    costs.development = 20000;
  }
  
  // Adjust for team strength (lower team = need more resources)
  const teamAdjustment = (10 - teamStrength) * 0.1;
  costs.development *= (1 + teamAdjustment);
  
  // Marketing budget (typically 20% of development)
  costs.marketing = costs.development * 0.3;
  
  // Legal & compliance
  costs.legal = 5000;
  
  // Infrastructure (servers, tools, software)
  costs.infrastructure = businessModel.type === 'SaaS' ? 10000 : 5000;
  
  // Operations (office, equipment, etc.)
  costs.operations = 15000;
  
  // Contingency (20%)
  const subtotal = Object.values(costs).reduce((a, b) => a + b, 0);
  costs.contingency = subtotal * 0.2;
  
  // Total
  const total = Object.values(costs).reduce((a, b) => a + b, 0);
  
  return {
    breakdown: costs,
    total: Math.round(total),
    currency: 'USD'
  };
}

/**
 * Calculate monthly burn rate
 */
function calculateMonthlyBurnRate(startupCosts, teamStrength) {
  const teamSize = Math.max(1, Math.ceil(teamStrength / 2));
  
  const monthlyExpenses = {
    salaries: teamSize * 5000, // Average $5k per person
    marketing: 5000,
    infrastructure: 1000,
    operations: 2000,
    miscellaneous: 2000
  };
  
  const total = Object.values(monthlyExpenses).reduce((a, b) => a + b, 0);
  
  return {
    breakdown: monthlyExpenses,
    total: Math.round(total),
    currency: 'USD'
  };
}

/**
 * Generate 3-year revenue projections
 */
function generateRevenueProjections(businessModel, marketSize, traction) {
  const projections = {
    year1: { months: [] },
    year2: { months: [] },
    year3: { months: [] }
  };
  
  // Determine growth rate based on traction
  let monthlyGrowthRate = 0.15; // 15% default
  
  const tractionLower = String(traction).toLowerCase();
  if (tractionLower.includes('revenue')) {
    monthlyGrowthRate = 0.20;
  } else if (tractionLower.includes('users')) {
    monthlyGrowthRate = 0.18;
  } else if (tractionLower.includes('mvp')) {
    monthlyGrowthRate = 0.12;
  } else {
    monthlyGrowthRate = 0.10;
  }
  
  // Starting revenue (based on traction)
  let currentRevenue = tractionLower.includes('revenue') ? 5000 : 0;
  
  // Year 1 projections
  for (let month = 1; month <= 12; month++) {
    currentRevenue = currentRevenue * (1 + monthlyGrowthRate);
    projections.year1.months.push({
      month,
      revenue: Math.round(currentRevenue),
      customers: Math.round(currentRevenue / businessModel.avgCustomerValue)
    });
  }
  
  // Year 2 projections (slower growth)
  monthlyGrowthRate *= 0.8;
  for (let month = 1; month <= 12; month++) {
    currentRevenue = currentRevenue * (1 + monthlyGrowthRate);
    projections.year2.months.push({
      month,
      revenue: Math.round(currentRevenue),
      customers: Math.round(currentRevenue / businessModel.avgCustomerValue)
    });
  }
  
  // Year 3 projections (further maturation)
  monthlyGrowthRate *= 0.7;
  for (let month = 1; month <= 12; month++) {
    currentRevenue = currentRevenue * (1 + monthlyGrowthRate);
    projections.year3.months.push({
      month,
      revenue: Math.round(currentRevenue),
      customers: Math.round(currentRevenue / businessModel.avgCustomerValue)
    });
  }
  
  // Calculate totals
  projections.year1.total = projections.year1.months.reduce((sum, m) => sum + m.revenue, 0);
  projections.year2.total = projections.year2.months.reduce((sum, m) => sum + m.revenue, 0);
  projections.year3.total = projections.year3.months.reduce((sum, m) => sum + m.revenue, 0);
  
  projections.year1.avgMonthly = Math.round(projections.year1.total / 12);
  projections.year2.avgMonthly = Math.round(projections.year2.total / 12);
  projections.year3.avgMonthly = Math.round(projections.year3.total / 12);
  
  return projections;
}

/**
 * Calculate break-even point
 */
function calculateBreakEven(revenueProjections, monthlyBurnRate) {
  let cumulativeRevenue = 0;
  let cumulativeCosts = 0;
  let breakEvenMonth = null;
  
  // Check Year 1
  for (let i = 0; i < revenueProjections.year1.months.length; i++) {
    cumulativeRevenue += revenueProjections.year1.months[i].revenue;
    cumulativeCosts += monthlyBurnRate.total;
    
    if (cumulativeRevenue >= cumulativeCosts && !breakEvenMonth) {
      breakEvenMonth = i + 1;
      break;
    }
  }
  
  // Check Year 2
  if (!breakEvenMonth) {
    for (let i = 0; i < revenueProjections.year2.months.length; i++) {
      cumulativeRevenue += revenueProjections.year2.months[i].revenue;
      cumulativeCosts += monthlyBurnRate.total;
      
      if (cumulativeRevenue >= cumulativeCosts) {
        breakEvenMonth = 12 + i + 1;
        break;
      }
    }
  }
  
  // Check Year 3
  if (!breakEvenMonth) {
    for (let i = 0; i < revenueProjections.year3.months.length; i++) {
      cumulativeRevenue += revenueProjections.year3.months[i].revenue;
      cumulativeCosts += monthlyBurnRate.total;
      
      if (cumulativeRevenue >= cumulativeCosts) {
        breakEvenMonth = 24 + i + 1;
        break;
      }
    }
  }
  
  return {
    month: breakEvenMonth || '>36',
    status: breakEvenMonth ? 'Achievable' : 'Challenging',
    cumulativeRevenue: Math.round(cumulativeRevenue),
    cumulativeCosts: Math.round(cumulativeCosts)
  };
}

/**
 * Calculate ROI timeline
 */
function calculateROITimeline(startupCosts, revenueProjections) {
  const totalInvestment = startupCosts.total;
  
  const year1Revenue = revenueProjections.year1.total;
  const year2Revenue = revenueProjections.year2.total;
  const year3Revenue = revenueProjections.year3.total;
  
  const totalRevenue3Years = year1Revenue + year2Revenue + year3Revenue;
  
  const roi = ((totalRevenue3Years - totalInvestment) / totalInvestment) * 100;
  
  return {
    initialInvestment: totalInvestment,
    expectedReturn3Years: Math.round(totalRevenue3Years),
    roi: Math.round(roi),
    roiStatus: roi > 200 ? 'Excellent' : roi > 100 ? 'Good' : roi > 0 ? 'Moderate' : 'Negative'
  };
}

/**
 * Calculate funding requirements
 */
function calculateFundingRequirements(startupCosts, monthlyBurnRate, breakEven) {
  const initialCosts = startupCosts.total;
  const monthsToBreakEven = typeof breakEven.month === 'number' ? breakEven.month : 24;
  const operatingCosts = monthlyBurnRate.total * monthsToBreakEven;
  
  const totalFunding = initialCosts + operatingCosts;
  const safetyBuffer = totalFunding * 0.3; // 30% buffer
  
  const recommendedFunding = totalFunding + safetyBuffer;
  
  return {
    minimum: Math.round(totalFunding),
    recommended: Math.round(recommendedFunding),
    breakdown: {
      initialCosts,
      operatingCosts: Math.round(operatingCosts),
      safetyBuffer: Math.round(safetyBuffer)
    },
    fundingStages: {
      seed: Math.round(recommendedFunding * 0.3),
      seriesA: Math.round(recommendedFunding * 0.7)
    }
  };
}

/**
 * Calculate profitability score
 */
function calculateProfitabilityScore(revenueProjections, monthlyBurnRate) {
  const year3Revenue = revenueProjections.year3.total;
  const year3Costs = monthlyBurnRate.total * 12;
  const year3Profit = year3Revenue - year3Costs;
  
  if (year3Profit < 0) return 20;
  if (year3Profit < year3Costs * 0.5) return 40;
  if (year3Profit < year3Costs) return 60;
  if (year3Profit < year3Costs * 2) return 80;
  return 95;
}

module.exports = {
  generateFinancialProjections
};
