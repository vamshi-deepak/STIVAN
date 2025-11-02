// ==========================================
// STIVAN 2.0 - DEMO & TEST SCRIPT
// ==========================================
// Demonstrates the revolutionary evaluation features

const { evaluateStartupIdea } = require('./services/masterEvaluator');

// Test idea examples
const testIdeas = [
  {
    name: 'Exceptional AI Startup',
    data: {
      title: 'AI-Powered Healthcare Diagnosis Platform',
      description: 'Revolutionary AI platform that analyzes medical images and patient data to provide accurate, early disease detection. Using proprietary machine learning algorithms trained on millions of medical records, we help doctors diagnose diseases 3x faster with 95% accuracy. We solve the critical problem of late disease detection which costs lives and billions in healthcare. We have partnerships with 5 major hospitals and early traction with 200 doctors using our MVP. Large market opportunity in healthcare technology.',
      marketSize: 'Large',
      teamStrength: 9,
      traction: 'Early Users'
    }
  },
  {
    name: 'Moderate SaaS Product',
    data: {
      title: 'Project Management Tool for Remote Teams',
      description: 'A project management SaaS platform designed for remote teams. Features include task tracking, video calls, file sharing, and time tracking. Similar to existing tools but with better UI/UX. Target audience is small to medium businesses.',
      marketSize: 'Medium',
      teamStrength: 6,
      traction: 'Idea Stage'
    }
  },
  {
    name: 'High-Risk Hardware Startup',
    data: {
      title: 'Personal Flying Car',
      description: 'Building a flying car for personal transportation. Competes with major automotive and aerospace companies. Requires significant regulatory approval and capital. High technical complexity with autonomous flight systems.',
      marketSize: 'Unknown',
      teamStrength: 4,
      traction: 'None'
    }
  }
];

// Run evaluations
async function runDemo() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 STIVAN 2.0 - REVOLUTIONARY EVALUATION DEMO');
  console.log('='.repeat(80) + '\n');
  
  for (const test of testIdeas) {
    console.log('\n' + '-'.repeat(80));
    console.log(`📋 Testing: ${test.name}`);
    console.log('-'.repeat(80));
    
    try {
      const result = await evaluateStartupIdea(test.data);
      
      // Display key results
      console.log('\n🎯 EVALUATION RESULTS:');
      console.log(`   Score: ${result.score}/100`);
      console.log(`   Verdict: ${result.verdict}`);
      console.log(`   Investment Readiness: ${result.investmentReadiness}`);
      console.log(`   Success Probability: ${result.successProbability}%`);
      
      console.log('\n📊 8-DIMENSIONAL BREAKDOWN:');
      Object.entries(result.breakdown).forEach(([key, value]) => {
        if (value !== undefined) {
          const bar = '█'.repeat(Math.floor(value / 5));
          console.log(`   ${key.padEnd(25)}: ${value.toString().padStart(3)}/100 ${bar}`);
        }
      });
      
      console.log('\n💰 FINANCIAL PROJECTIONS:');
      if (result.financialProjections) {
        const fp = result.financialProjections;
        console.log(`   Business Model: ${fp.businessModel?.type || 'N/A'}`);
        console.log(`   Startup Costs: $${(fp.startupCosts?.total || 0).toLocaleString()}`);
        console.log(`   Monthly Burn: $${(fp.monthlyBurnRate?.total || 0).toLocaleString()}`);
        console.log(`   Year 1 Revenue: $${(fp.revenueProjections?.year1?.total || 0).toLocaleString()}`);
        console.log(`   Year 3 Revenue: $${(fp.revenueProjections?.year3?.total || 0).toLocaleString()}`);
        console.log(`   Break-Even: ${fp.breakEven?.month || 'N/A'} months`);
        console.log(`   Funding Needed: $${(fp.fundingRequirements?.recommended || 0).toLocaleString()}`);
      }
      
      console.log('\n🎯 SWOT SUMMARY:');
      if (result.swot?.swot) {
        console.log(`   Strengths: ${result.swot.swot.strengths?.length || 0} identified`);
        console.log(`   Weaknesses: ${result.swot.swot.weaknesses?.length || 0} identified`);
        console.log(`   Opportunities: ${result.swot.swot.opportunities?.length || 0} identified`);
        console.log(`   Threats: ${result.swot.swot.threats?.length || 0} identified`);
      }
      
      console.log('\n🗺️ EXECUTION ROADMAP:');
      if (result.executionRoadmap) {
        console.log(`   Current Phase: ${result.executionRoadmap.currentPhase}`);
        console.log(`   Timeline to Launch: ${result.executionRoadmap.timeline?.totalToLaunch || 'N/A'}`);
        console.log(`   Timeline to Scale: ${result.executionRoadmap.timeline?.totalToScale || 'N/A'}`);
      }
      
      console.log('\n⭐ TOP 3 RECOMMENDATIONS:');
      if (result.topRecommendations && result.topRecommendations.length > 0) {
        result.topRecommendations.slice(0, 3).forEach((rec, i) => {
          console.log(`   ${i + 1}. [${rec.priority}] ${rec.action}`);
        });
      }
      
      console.log('\n🎬 IMMEDIATE NEXT STEPS:');
      if (result.immediateNextSteps && result.immediateNextSteps.length > 0) {
        result.immediateNextSteps.slice(0, 3).forEach((step, i) => {
          console.log(`   ${i + 1}. ${step}`);
        });
      }
      
      console.log('\n📋 EXECUTIVE SUMMARY:');
      if (result.executiveSummary) {
        console.log(`   ${result.executiveSummary.overview}`);
        console.log(`   \n   Recommendation: ${result.executiveSummary.recommendation}`);
      }
      
      console.log('\n✅ Evaluation Type: ' + result.evaluationMetadata?.evaluationType);
      console.log('✅ Features Used: ' + result.evaluationMetadata?.features?.join(', '));
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 DEMO COMPLETE!');
  console.log('='.repeat(80) + '\n');
  
  console.log('💡 Key Takeaways:');
  console.log('   ✅ 8-dimensional evaluation instead of single score');
  console.log('   ✅ Real market research data integration');
  console.log('   ✅ Professional financial projections');
  console.log('   ✅ Strategic SWOT analysis');
  console.log('   ✅ Phase-by-phase execution roadmap');
  console.log('   ✅ Actionable recommendations');
  console.log('   ✅ Deterministic and reproducible');
  console.log('\n🏆 This is why STIVAN 2.0 will win first prize!\n');
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };
