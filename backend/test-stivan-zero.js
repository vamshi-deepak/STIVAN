/**
 * STIVAN ANALYST ZERO - TEST SCRIPT
 * 
 * Tests the legendary market analyst with sample startup ideas
 * Shows real-time market intelligence and multi-AI analysis
 */

const axios = require('axios');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const API_BASE = 'http://localhost:5051';

// Test cases
const testIdeas = [
  {
    name: 'Strong Idea - HealthTech AI',
    data: {
      idea_title: 'HealthTrack AI',
      idea_summary: 'AI-powered health monitoring that predicts diseases before symptoms appear',
      idea_what: 'Predicts diseases 6-12 months before symptoms using wearable data and advanced ML',
      idea_how: 'Analyzes heart rate variability, sleep patterns, activity, and biomarkers using proprietary ML model trained on 5M+ patient records',
      idea_audience: 'Health-conscious adults 35-65, especially those with family history of disease',
      idea_market_size: 'Large',
      idea_team_strength: 9,
      idea_traction: 'MVP with 500 beta users, partnered with Mayo Clinic for validation study'
    }
  },
  {
    name: 'Medium Idea - EdTech Platform',
    data: {
      idea_title: 'LearnFast',
      idea_summary: 'Online learning platform with AI-personalized courses',
      idea_what: 'Personalized learning paths using AI to adapt to each student',
      idea_how: 'AI analyzes learning style and adjusts content difficulty and format',
      idea_audience: 'College students and professionals',
      idea_market_size: 'Medium',
      idea_team_strength: 6,
      idea_traction: 'Landing page, 50 signups'
    }
  },
  {
    name: 'Weak Idea - Generic App',
    data: {
      idea_title: 'CoolApp',
      idea_summary: 'An app for sharing stuff',
      idea_what: 'Users can share things they like',
      idea_how: 'Mobile app with social features',
      idea_audience: 'Everyone',
      idea_market_size: 'Small',
      idea_team_strength: 3,
      idea_traction: 'Just an idea'
    }
  }
];

/**
 * Print section header
 */
function printHeader(text) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

/**
 * Print subsection
 */
function printSubHeader(text) {
  console.log(`\n${colors.bright}${colors.yellow}${text}${colors.reset}`);
  console.log(`${colors.yellow}${'-'.repeat(text.length)}${colors.reset}`);
}

/**
 * Print key-value pair
 */
function printKV(key, value, color = colors.reset) {
  console.log(`${colors.bright}${key}:${colors.reset} ${color}${value}${colors.reset}`);
}

/**
 * Test a single idea
 */
async function testIdea(testCase) {
  printHeader(`🧪 TEST: ${testCase.name}`);

  // Show input
  printSubHeader('📥 Input Data');
  printKV('Title', testCase.data.idea_title, colors.blue);
  printKV('Summary', testCase.data.idea_summary);
  printKV('What', testCase.data.idea_what);
  printKV('Market Size', testCase.data.idea_market_size);
  printKV('Team Strength', testCase.data.idea_team_strength);
  printKV('Traction', testCase.data.idea_traction);

  try {
    console.log(`\n${colors.yellow}⏳ Analyzing with STIVAN Analyst Zero...${colors.reset}`);
    console.log(`${colors.yellow}   (This may take 10-30 seconds - gathering real-time market data)${colors.reset}`);

    const startTime = Date.now();
    const response = await axios.post(`${API_BASE}/api/vision/evaluate`, testCase.data);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    const { data } = response.data;

    // Show results
    printSubHeader(`✅ Analysis Complete (${duration}s)`);

    // Overall verdict
    const verdictColor = data.score >= 80 ? colors.green : 
                        data.score >= 60 ? colors.yellow : colors.red;
    printKV('Overall Score', `${data.score}/100`, verdictColor);
    printKV('Verdict', data.finalVerdict, verdictColor);
    printKV('Domain', data.domain, colors.cyan);

    // Category tags
    if (data.categoryTags && data.categoryTags.length > 0) {
      console.log(`${colors.bright}Tags:${colors.reset} ${data.categoryTags.map(t => `#${t}`).join(' ')}`);
    }

    // Competitors found
    if (data.competitors && data.competitors.length > 0) {
      printSubHeader(`🏢 Competitors Found (${data.competitors.length})`);
      data.competitors.slice(0, 3).forEach((comp, i) => {
        console.log(`\n${colors.bright}${i+1}. ${comp.name}${colors.reset}`);
        console.log(`   ${comp.description}`);
        if (comp.strengths && comp.strengths.length > 0) {
          console.log(`   ${colors.green}Strengths: ${comp.strengths.slice(0, 2).join(', ')}${colors.reset}`);
        }
        if (comp.weaknesses && comp.weaknesses.length > 0) {
          console.log(`   ${colors.red}Weaknesses: ${comp.weaknesses.slice(0, 2).join(', ')}${colors.reset}`);
        }
        console.log(`   Stage: ${comp.stage} | Funding: ${comp.funding}`);
      });
      if (data.competitors.length > 3) {
        console.log(`\n   ${colors.yellow}+ ${data.competitors.length - 3} more competitors...${colors.reset}`);
      }
    }

    // Scores breakdown
    if (data.scores) {
      printSubHeader('📊 Score Breakdown');
      Object.entries(data.scores).forEach(([dim, score]) => {
        const label = dim.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));
        const scoreColor = score >= 80 ? colors.green : 
                          score >= 60 ? colors.yellow : colors.red;
        console.log(`   ${label.padEnd(25)} ${scoreColor}${bar} ${score}/100${colors.reset}`);
      });
    }

    // Market outlook
    if (data.marketOutlook) {
      printSubHeader('📈 Market Outlook (3-5 Years)');
      console.log(`   ${data.marketOutlook.substring(0, 200)}...`);
    }

    // Stock market analysis
    if (data.stockMarketAnalysis) {
      printSubHeader('💼 Stock Market Analysis');
      const sma = data.stockMarketAnalysis;
      printKV('   Investor Appeal', sma.investor_appeal, colors.magenta);
      printKV('   Growth Trajectory', sma.growth_trajectory, colors.magenta);
      printKV('   Exit Potential', sma.exit_potential, colors.magenta);
      printKV('   Valuation Potential', sma.valuation_potential, colors.magenta);
      
      if (sma.risk_factors && sma.risk_factors.length > 0) {
        console.log(`   ${colors.red}Risk Factors:${colors.reset}`);
        sma.risk_factors.slice(0, 3).forEach(risk => {
          console.log(`     • ${risk}`);
        });
      }
    }

    // Competitive advantages
    if (data.competitiveAdvantages && data.competitiveAdvantages.length > 0) {
      printSubHeader('✨ Competitive Advantages');
      data.competitiveAdvantages.forEach(adv => {
        console.log(`   ${colors.green}✓${colors.reset} ${adv}`);
      });
    }

    // Critical weaknesses
    if (data.criticalWeaknesses && data.criticalWeaknesses.length > 0) {
      printSubHeader('⚠️  Critical Weaknesses');
      data.criticalWeaknesses.forEach(weak => {
        console.log(`   ${colors.red}✗${colors.reset} ${weak}`);
      });
    }

    // Actionable advice
    if (data.actionableAdvice && data.actionableAdvice.length > 0) {
      printSubHeader('💡 Actionable Advice');
      data.actionableAdvice.forEach((advice, i) => {
        console.log(`   ${colors.cyan}${i+1}.${colors.reset} ${advice}`);
      });
    }

    // Verdict reasoning
    if (data.verdictReasoning) {
      printSubHeader('🎯 Final Verdict Reasoning');
      console.log(`   ${data.verdictReasoning.substring(0, 300)}...`);
    }

    // Metadata
    if (data.modelsUsed || data.marketIntelligence) {
      printSubHeader('🔧 Analysis Metadata');
      if (data.analyst) {
        printKV('   Analyst', data.analyst, colors.magenta);
      }
      if (data.modelsUsed && data.modelsUsed.length > 0) {
        console.log(`   ${colors.bright}AI Models Used:${colors.reset}`);
        data.modelsUsed.forEach(model => {
          console.log(`     • ${model.name} (${model.role})`);
        });
      }
      if (data.marketIntelligence) {
        const mi = data.marketIntelligence;
        printKV('   Sources Consulted', mi.sources_consulted || 'N/A');
        printKV('   Live Data Included', mi.live_data_included ? 'Yes' : 'No');
      }
    }

    console.log(`\n${colors.green}✅ Test passed!${colors.reset}`);
    return true;

  } catch (error) {
    console.error(`\n${colors.red}❌ Test failed!${colors.reset}`);
    if (error.response) {
      console.error(`${colors.red}Status: ${error.response.status}${colors.reset}`);
      console.error(`${colors.red}Error: ${JSON.stringify(error.response.data, null, 2)}${colors.reset}`);
    } else {
      console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    }
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  printHeader('🌟 STIVAN ANALYST ZERO - TEST SUITE');

  console.log(`${colors.bright}This script tests the legendary market analyst with 3 sample ideas:${colors.reset}`);
  console.log(`  1. ${colors.green}Strong Idea${colors.reset} - Well-defined HealthTech with clear value prop`);
  console.log(`  2. ${colors.yellow}Medium Idea${colors.reset} - EdTech with some differentiation`);
  console.log(`  3. ${colors.red}Weak Idea${colors.reset} - Generic app with no clear value`);

  console.log(`\n${colors.bright}What to expect:${colors.reset}`);
  console.log(`  • Real-time market intelligence gathering`);
  console.log(`  • Actual competitor analysis from live web data`);
  console.log(`  • Multi-AI expert panel analysis`);
  console.log(`  • Stock market perspective and exit potential`);
  console.log(`  • Strategic positioning advice`);
  console.log(`  • Actionable next steps`);

  console.log(`\n${colors.yellow}⚠️  Make sure:${colors.reset}`);
  console.log(`  • Backend server is running (npm start)`);
  console.log(`  • GEMINI_API_KEY is set in .env`);
  console.log(`  • PERPLEXITY_API_KEY is set (for best results!)`);

  console.log(`\n${colors.cyan}Press Ctrl+C to cancel, or wait 3 seconds to start...${colors.reset}`);
  await new Promise(resolve => setTimeout(resolve, 3000));

  let passed = 0;
  let failed = 0;

  for (const testCase of testIdeas) {
    const success = await testIdea(testCase);
    if (success) {
      passed++;
    } else {
      failed++;
    }

    // Wait between tests
    if (testIdeas.indexOf(testCase) < testIdeas.length - 1) {
      console.log(`\n${colors.yellow}⏸  Waiting 2 seconds before next test...${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Final summary
  printHeader('📊 TEST SUMMARY');
  printKV('Total Tests', testIdeas.length);
  printKV('Passed', passed, colors.green);
  printKV('Failed', failed, failed > 0 ? colors.red : colors.green);

  if (failed === 0) {
    console.log(`\n${colors.bright}${colors.green}🎉 All tests passed! STIVAN Analyst Zero is working perfectly!${colors.reset}`);
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  1. Update frontend to display vision analysis`);
    console.log(`  2. Add competitor comparison visualizations`);
    console.log(`  3. Show stock market analysis charts`);
    console.log(`  4. Display citations from Perplexity sources`);
  } else {
    console.log(`\n${colors.red}⚠️  Some tests failed. Check the errors above.${colors.reset}`);
    console.log(`\n${colors.yellow}Common issues:${colors.reset}`);
    console.log(`  • Backend not running: Run 'npm start' in backend directory`);
    console.log(`  • Missing API keys: Add GEMINI_API_KEY and PERPLEXITY_API_KEY to .env`);
    console.log(`  • MongoDB not connected: Check MongoDB connection string`);
  }

  console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
