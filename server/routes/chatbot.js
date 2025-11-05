const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/chatbot');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.filename));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|mp4|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpg, jpeg, png) and videos (mp4, mov) are allowed!'));
    }
  }
});

// Seven Four Clothing specific responses
const sevenFourResponses = {
  // Greetings
  'greeting': 'Hello! Welcome to Seven Four Clothing! 👋 How can I assist you today?',
  'hello': 'Hi there! Welcome to Seven Four Clothing! I\'m here to help you with orders, products, or any questions you have.',
  
  // Products
  'products': 'At Seven Four Clothing, we offer a wide range of trendy apparel including shirts, pants, jackets, and accessories. You can browse our products on the Products page or use the search feature to find specific items!',
  'clothing': 'We specialize in high-quality, stylish clothing for all occasions. Check out our latest collections on the Products page!',
  'shirt': 'We have a variety of shirts available! You can filter by color, size, and price on our Products page. Some items may be on sale!',
  'pants': 'Our pants collection includes various styles and sizes. Visit the Products page to see our full selection!',
  'sale': 'Great question! Check out our products marked "On Sale" for special discounts. We regularly update our sale items!',
  'price': 'Product prices vary by item. You can see the exact price on each product\'s detail page. Look for "On Sale" tags for discounted items!',
  
  // Orders
  'order': 'To check your order status, please visit the My Orders page in your account. You can track delivery status, view order details, and see estimated delivery dates.',
  'track': 'You can track your order in the My Orders section. If you\'ve scheduled a delivery, you\'ll see the expected delivery date and courier information.',
  'delivery': 'We deliver to Metro Manila (NCR) areas. Delivery typically takes 2-7 business days depending on your location. You can schedule deliveries Monday-Saturday, 9:00 AM - 5:00 PM.',
  'shipping': 'We currently ship within Metro Manila. Shipping costs are calculated at checkout based on your location. Scheduled deliveries are available!',
  'cancel': 'To cancel an order, please go to My Orders and click the Cancel button if the order hasn\'t been shipped yet. For orders in transit, please contact support.',
  
  // Account
  'account': 'You can manage your account in the Account Settings page. Update your profile, change your password, and manage your addresses there.',
  'login': 'To log in, click the Login button in the navigation bar and enter your email and password. If you don\'t have an account, you can register!',
  'register': 'To create an account, click Register in the navigation bar and fill in your details. You\'ll be able to track orders and save your preferences!',
  'password': 'To change your password, go to Account Settings. If you forgot your password, use the "Forgot Password" link on the login page.',
  
  // Payment & Refunds
  'payment': 'We accept GCash for payments. Payment is typically processed upon delivery. You\'ll see payment status in your order details.',
  'gcash': 'Yes! We accept GCash payments. Our courier will confirm payment upon delivery.',
  'refund': 'For refund requests, please go to My Orders and submit a refund request. Our team will review it within 2-3 business days. You may need to upload proof of the issue.',
  'return': 'Returns are accepted within 7 days of delivery for unused items with tags. Please submit a return request through My Orders.',
  
  // Custom Orders
  'custom': 'Yes! We accept custom design orders. Visit the Custom Design page to submit your design request. Our team will review it and get back to you with pricing and timeline.',
  'design': 'You can request custom designs on our Custom Design page. Upload your design or describe what you want, and we\'ll create it for you!',
  
  // Support
  'help': 'I\'m here to help! You can ask about products, orders, delivery, payments, custom designs, or account issues. What do you need help with?',
  'contact': 'For urgent issues, you can contact us through the Contact page or email us. For order-specific issues, use the My Orders page to submit requests.',
  'hours': 'Our delivery service operates Monday-Saturday, 9:00 AM - 5:00 PM. Online orders can be placed 24/7!',
  
  // Default
  'default': 'I\'m here to help with Seven Four Clothing! You can ask me about products, orders, delivery, custom designs, or account issues. What would you like to know?'
};

// Simple intent detection based on keywords
function detectIntent(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Greetings
  if (/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(lowerMessage)) {
    return 'greeting';
  }
  
  // Products
  if (/\b(product|item|clothing|clothes|apparel|shirt|pants|jacket|dress)\b/.test(lowerMessage)) {
    if (/\b(shirt)\b/.test(lowerMessage)) return 'shirt';
    if (/\b(pants|trousers)\b/.test(lowerMessage)) return 'pants';
    return 'products';
  }
  
  if (/\b(sale|discount|promo|offer)\b/.test(lowerMessage)) {
    return 'sale';
  }
  
  if (/\b(price|cost|how much)\b/.test(lowerMessage)) {
    return 'price';
  }
  
  // Orders
  if (/\b(order|purchase|buy|bought)\b/.test(lowerMessage)) {
    return 'order';
  }
  
  if (/\b(track|tracking|where is|status)\b/.test(lowerMessage)) {
    return 'track';
  }
  
  if (/\b(deliver|delivery|shipping|ship)\b/.test(lowerMessage)) {
    if (/\b(shipping)\b/.test(lowerMessage)) return 'shipping';
    return 'delivery';
  }
  
  if (/\b(cancel|cancellation)\b/.test(lowerMessage)) {
    return 'cancel';
  }
  
  // Account
  if (/\b(account|profile|settings)\b/.test(lowerMessage)) {
    return 'account';
  }
  
  if (/\b(login|log in|sign in)\b/.test(lowerMessage)) {
    return 'login';
  }
  
  if (/\b(register|sign up|signup|create account)\b/.test(lowerMessage)) {
    return 'register';
  }
  
  if (/\b(password|forgot password|reset password)\b/.test(lowerMessage)) {
    return 'password';
  }
  
  // Payment & Refunds
  if (/\b(payment|pay|paying)\b/.test(lowerMessage)) {
    return 'payment';
  }
  
  if (/\b(gcash)\b/.test(lowerMessage)) {
    return 'gcash';
  }
  
  if (/\b(refund|money back)\b/.test(lowerMessage)) {
    return 'refund';
  }
  
  if (/\b(return|returning)\b/.test(lowerMessage)) {
    return 'return';
  }
  
  // Custom Orders
  if (/\b(custom|customize|personalize)\b/.test(lowerMessage)) {
    return 'custom';
  }
  
  if (/\b(design|designer|designing)\b/.test(lowerMessage)) {
    return 'design';
  }
  
  // Support
  if (/\b(help|support|assist|question)\b/.test(lowerMessage)) {
    return 'help';
  }
  
  if (/\b(contact|email|phone|reach)\b/.test(lowerMessage)) {
    return 'contact';
  }
  
  if (/\b(hours|time|schedule|open)\b/.test(lowerMessage)) {
    return 'hours';
  }
  
  return 'default';
}

// Get chatbot response
router.post('/get_response', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ response: 'Please enter a message.' });
    }
    
    const intent = detectIntent(message);
    const response = sevenFourResponses[intent] || sevenFourResponses['default'];
    
    console.log(`\n🗣️ User Input: ${message}`);
    console.log(`Predicted Intent: ${intent}`);
    console.log(`Bot Reply: ${response}\n`);
    
    res.json({ response });
  } catch (error) {
    console.error('❌ Error processing chatbot request:', error);
    res.status(500).json({ response: 'Sorry, something went wrong while processing your message.' });
  }
});

// File upload endpoint
router.post('/upload_file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ response: 'No file uploaded.' });
    }
    
    const ext = path.extname(req.file.filename).toLowerCase();
    
    let autoReply = '📎 Thanks for uploading your file! I\'ll take a moment to review it to better understand your issue. Please hold on while I process the details.';
    let followUp = '';
    
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      followUp = '🖼️ I\'ve reviewed the image you uploaded. Could you please provide your order number or the email linked to your account so I can proceed with your request?';
    } else if (['.mp4', '.mov'].includes(ext)) {
      followUp = '🎥 I\'ve reviewed your video and forwarded it to our verification team. Could you please share your order ID and a short description of the issue?';
    } else {
      followUp = '⚠️ It seems your uploaded file might not relate to a product issue. Please upload a clear photo or video of the affected item or receipt so we can help you better.';
    }
    
    res.json({
      response: autoReply,
      follow_up: followUp,
      delay: 2000
    });
  } catch (error) {
    console.error('❌ File upload error:', error);
    res.status(500).json({ response: 'Sorry, there was an issue processing your file.' });
  }
});

module.exports = router;
