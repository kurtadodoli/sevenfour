// routes/api/customizations.js
const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const adminCheck = require('../../middleware/adminCheck');

// Mock database for customization requests
let customizationRequests = [
  {
    id: 1,
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    customerPhone: '+1-555-0123',
    status: 'pending',
    submittedDate: '2025-06-10',
    garmentType: 'T-Shirt',
    baseColor: '#FF0000',
    designDescription: 'Custom logo design with company branding',
    designImage: '/api/placeholder/300/300',
    customMessage: 'I need this for our company event next month. Please make sure the logo is centered and bold.',
    estimatedPrice: 45.00,
    urgency: 'normal',
    userId: 1
  },
  {
    id: 2,
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    customerPhone: '+1-555-0456',
    status: 'approved',
    submittedDate: '2025-06-08',
    garmentType: 'Hoodie',
    baseColor: '#000000',
    designDescription: 'Vintage band tour design with distressed effects',
    designImage: '/api/placeholder/300/300',
    customMessage: 'Looking for a vintage 80s rock band aesthetic. Can you add some distressed effects?',
    estimatedPrice: 75.00,
    urgency: 'high',
    adminResponse: 'Approved! Love the vintage concept. Production will start tomorrow.',
    userId: 2
  }
];

// GET /api/customizations - Admin only: Get all customization requests
router.get('/', auth, adminCheck, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let filtered = [...customizationRequests];
    
    // Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter(request => request.status === status);
    }
    
    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(request => 
        request.customerName.toLowerCase().includes(searchLower) ||
        request.customerEmail.toLowerCase().includes(searchLower) ||
        request.garmentType.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by submission date (newest first)
    filtered.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    
    res.json({
      success: true,
      data: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error fetching customization requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customization requests'
    });
  }
});

// GET /api/customizations/:id - Get specific customization request
router.get('/:id', auth, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const request = customizationRequests.find(r => r.id === requestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Customization request not found'
      });
    }
    
    // Check if user is admin or owns the request
    if (req.user.role !== 'admin' && request.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching customization request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customization request'
    });
  }
});

// POST /api/customizations - Create new customization request
router.post('/', auth, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      garmentType,
      baseColor,
      designDescription,
      customMessage,
      urgency,
      estimatedPrice
    } = req.body;
    
    // Validation
    if (!customerName || !customerEmail || !garmentType || !designDescription) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create new request
    const newRequest = {
      id: customizationRequests.length + 1,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      garmentType,
      baseColor,
      designDescription,
      customMessage: customMessage || '',
      urgency: urgency || 'normal',
      estimatedPrice: estimatedPrice || 35.00,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      userId: req.user.id,
      designImage: null // Would handle file upload separately
    };
    
    customizationRequests.push(newRequest);
    
    res.status(201).json({
      success: true,
      message: 'Customization request submitted successfully',
      data: newRequest
    });
  } catch (error) {
    console.error('Error creating customization request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating customization request'
    });
  }
});

// PUT /api/customizations/:id/status - Admin only: Update request status
router.put('/:id/status', auth, adminCheck, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { status, adminResponse } = req.body;
    
    const requestIndex = customizationRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Customization request not found'
      });
    }
    
    // Valid status values
    const validStatuses = ['pending', 'in_review', 'approved', 'declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // Update the request
    customizationRequests[requestIndex] = {
      ...customizationRequests[requestIndex],
      status,
      adminResponse: adminResponse || customizationRequests[requestIndex].adminResponse,
      reviewedDate: new Date().toISOString().split('T')[0],
      reviewedBy: req.user.id
    };
    
    res.json({
      success: true,
      message: 'Customization request updated successfully',
      data: customizationRequests[requestIndex]
    });
  } catch (error) {
    console.error('Error updating customization request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating customization request'
    });
  }
});

// GET /api/customizations/user/me - Get current user's customization requests
router.get('/user/me', auth, async (req, res) => {
  try {
    const userRequests = customizationRequests.filter(request => request.userId === req.user.id);
    
    // Sort by submission date (newest first)
    userRequests.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    
    res.json({
      success: true,
      data: userRequests,
      total: userRequests.length
    });
  } catch (error) {
    console.error('Error fetching user customization requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customization requests'
    });
  }
});

// DELETE /api/customizations/:id - Delete customization request
router.delete('/:id', auth, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const requestIndex = customizationRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Customization request not found'
      });
    }
    
    const request = customizationRequests[requestIndex];
    
    // Check if user is admin or owns the request
    if (req.user.role !== 'admin' && request.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Only allow deletion if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete request that is already being processed'
      });
    }
    
    customizationRequests.splice(requestIndex, 1);
    
    res.json({
      success: true,
      message: 'Customization request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customization request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting customization request'
    });
  }
});

module.exports = router;
