// Vercel Serverless entry point
// Exports the Express app so Vercel can handle all routes through this function
const app = require('../app');

// Export the Express app as the handler
module.exports = app;
