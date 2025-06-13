const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5001',
      // Add explicit origins for testing
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    
    // Add production URLs if needed
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(process.env.CLIENT_URL);
    }
    
    console.log('Request origin:', origin);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS allowing new origin:', origin);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'x-access-token'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;