// Direct test of vision routes loading
try {
  console.log('Loading visionRoutes...');
  const visionRoutes = require('./routes/visionRoutes');
  console.log('✅ visionRoutes loaded successfully');
  console.log('Type:', typeof visionRoutes);
  console.log('Routes:', visionRoutes.stack ? visionRoutes.stack.map(r => r.route) : 'No stack');
} catch (error) {
  console.error('❌ Error loading visionRoutes:');
  console.error(error);
}
