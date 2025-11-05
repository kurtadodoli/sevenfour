# Customer Support Chatbot Integration

## Overview
A fully integrated, AI-powered customer support chatbot specifically designed for **Seven Four Clothing**. The chatbot provides instant assistance to customers about products, orders, delivery, payments, and custom designs.

## Features

### 🤖 Intelligent Response System
- **Intent-based responses**: Automatically detects customer intent from messages
- **Seven Four Clothing specific knowledge**: Customized responses about your products, services, and policies
- **Smart keyword matching**: Understands natural language queries

### 💬 User Interface
- **Floating chat widget**: Always accessible from any page
- **Modern, responsive design**: Works perfectly on desktop and mobile
- **Smooth animations**: Professional slide-in/out transitions
- **Typing indicators**: Shows when the bot is "thinking"
- **Quick suggestions**: Pre-defined questions for easy access

### 📎 File Upload Support
- **Image uploads**: Customers can upload product images for issues
- **Video uploads**: Support for video evidence of problems
- **File size limit**: 15MB maximum
- **Automatic processing**: Bot provides context-aware responses based on file type

## Supported Topics

### 🛍️ Products
- Product information and availability
- Sale items and discounts
- Pricing inquiries
- Product categories (shirts, pants, jackets, etc.)

### 📦 Orders
- Order tracking and status
- Order history
- Cancellation requests
- Order modifications

### 🚚 Delivery
- Delivery schedules (Mon-Sat, 9AM-5PM)
- Metro Manila coverage
- Delivery time estimates (2-7 business days)
- Courier information

### 💳 Payments & Refunds
- GCash payment information
- Refund process and timelines
- Return policies (7-day return window)

### 🎨 Custom Orders
- Custom design requests
- Design upload process
- Custom order timeline
- Pricing for custom work

### 👤 Account Management
- Login/Registration assistance
- Password reset help
- Profile management
- Account settings

## Technical Implementation

### Backend (Node.js/Express)

**File**: `server/routes/chatbot.js`

Features:
- RESTful API endpoints
- Intent detection using keyword matching
- File upload handling with Multer
- Error handling and logging
- Customized responses for Seven Four Clothing

**Endpoints**:
- `POST /api/chatbot/get_response` - Get chatbot response
- `POST /api/chatbot/upload_file` - Handle file uploads

### Frontend (React)

**File**: `client/src/components/Chatbot.js`

Features:
- Styled-components for modern UI
- State management for messages
- Axios for API communication
- File upload with preview
- Typing indicators
- Quick suggestion buttons
- Auto-scroll to latest message

## Installation

### Dependencies Already Installed
```bash
# Backend
npm install multer  # For file uploads

# Frontend (already in package.json)
- axios
- styled-components
- react
```

### Configuration

1. **Server Integration** (Already done)
   - Chatbot routes added to `server/server.js`
   - Upload directory created at `uploads/chatbot/`

2. **Client Integration** (Already done)
   - Chatbot component added to `App.js`
   - Available on all pages

## Usage

### For Customers

1. **Open the chatbot**:
   - Click the floating chat button (💬) in the bottom-right corner

2. **Ask questions**:
   - Type your question or click a suggestion
   - Wait for the bot's response

3. **Upload files** (if needed):
   - Click the 📎 icon
   - Select an image or video
   - Wait for processing

### Example Conversations

**Product Inquiry**:
```
User: "Do you have shirts on sale?"
Bot: "Great question! Check out our products marked 'On Sale' for special discounts. We regularly update our sale items!"
```

**Order Tracking**:
```
User: "Where is my order?"
Bot: "You can track your order in the My Orders section. If you've scheduled a delivery, you'll see the expected delivery date and courier information."
```

**Custom Design**:
```
User: "Can I order a custom design?"
Bot: "Yes! We accept custom design orders. Visit the Custom Design page to submit your design request. Our team will review it and get back to you with pricing and timeline."
```

## Customization

### Adding New Responses

Edit `server/routes/chatbot.js`:

```javascript
const sevenFourResponses = {
  'your_intent': 'Your custom response here',
  // Add more intents and responses
};
```

### Adding New Intent Detection

Edit the `detectIntent` function in `server/routes/chatbot.js`:

```javascript
function detectIntent(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  if (/\b(your|keywords|here)\b/.test(lowerMessage)) {
    return 'your_intent';
  }
  
  // Add more intent detection logic
}
```

### Styling Customization

Edit `client/src/components/Chatbot.js`:

- Change colors in the gradient backgrounds
- Modify button styles
- Adjust chat window dimensions
- Customize animations

## File Structure

```
sevenfour/
├── server/
│   └── routes/
│       └── chatbot.js          # Chatbot backend logic
├── client/
│   └── src/
│       └── components/
│           └── Chatbot.js      # Chatbot UI component
└── uploads/
    └── chatbot/                # Uploaded files storage
```

## Security Features

- **File type validation**: Only allows specific image and video formats
- **File size limits**: 15MB maximum to prevent abuse
- **Input sanitization**: Cleans user input before processing
- **Error handling**: Graceful error messages for users

## Future Enhancements

Potential improvements:
- [ ] Integration with Google Gemini AI for advanced queries
- [ ] Conversation history storage in database
- [ ] Admin panel to view chatbot conversations
- [ ] Multi-language support
- [ ] Voice message support
- [ ] Automated order lookup using order number
- [ ] Real-time agent handoff for complex issues

## Troubleshooting

### Chatbot not appearing
- Check if `Chatbot` component is imported in `App.js`
- Verify browser console for errors
- Ensure server is running on port 5000

### File upload not working
- Check `uploads/chatbot/` directory exists
- Verify file size is under 15MB
- Ensure file type is supported (jpg, png, mp4, mov)

### Responses not working
- Verify server is running
- Check API endpoint is accessible at `http://localhost:5000/api/chatbot/get_response`
- Review browser console for network errors

## Support

For issues or questions about the chatbot integration, please refer to:
- Server logs in the terminal
- Browser console for client-side errors
- Network tab for API communication issues

---

**Integration Status**: ✅ Complete and Operational
**Last Updated**: November 6, 2025
**Version**: 1.0.0
