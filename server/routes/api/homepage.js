const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const adminCheck = require('../../middleware/adminCheck');

// Mock homepage content storage (in production, this would be in a database)
let homepageContent = {
  hero: {
    title: "Welcome to Seven Four Clothing",
    subtitle: "Discover our latest collection of premium streetwear designed for comfort and style.",
    buttonText: "Shop Now",
    backgroundImage: "/api/placeholder/1200/600"
  },
  featuredProducts: [
    {
      id: 1,
      name: "Classic T-Shirt",
      price: "₱999.00",
      image: "/api/placeholder/250/200",
      position: 1,
      category: "t-shirts"
    },
    {
      id: 2,
      name: "Denim Jacket",
      price: "₱2,499.00",
      image: "/api/placeholder/250/200",
      position: 2,
      category: "jackets"
    },
    {
      id: 3,
      name: "Summer Hoodie",
      price: "₱1,799.00",
      image: "/api/placeholder/250/200",
      position: 3,
      category: "hoodies"
    },
    {
      id: 4,
      name: "Casual Shorts",
      price: "₱899.00",
      image: "/api/placeholder/250/200",
      position: 4,
      category: "shorts"
    }
  ]
};

// GET /api/admin/homepage - Get current homepage content
router.get('/', auth, adminCheck, async (req, res) => {
  try {
    res.json({
      success: true,
      data: homepageContent
    });
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homepage content'
    });
  }
});

// POST /api/admin/homepage - Update homepage content
router.post('/', auth, adminCheck, async (req, res) => {
  try {
    const { hero, featuredProducts } = req.body;

    if (!hero || !featuredProducts) {
      return res.status(400).json({
        success: false,
        message: 'Hero section and featured products are required'
      });
    }

    // Validate featured products structure
    if (!Array.isArray(featuredProducts) || featuredProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Featured products must be a non-empty array'
      });
    }

    // Update homepage content
    homepageContent = {
      hero: {
        title: hero.title || homepageContent.hero.title,
        subtitle: hero.subtitle || homepageContent.hero.subtitle,
        buttonText: hero.buttonText || homepageContent.hero.buttonText,
        backgroundImage: hero.backgroundImage || homepageContent.hero.backgroundImage
      },
      featuredProducts: featuredProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        position: product.position,
        category: product.category || 't-shirts'
      }))
    };

    console.log('Homepage content updated by admin:', req.user.email);
    console.log('Updated content:', JSON.stringify(homepageContent, null, 2));

    res.json({
      success: true,
      message: 'Homepage content updated successfully',
      data: homepageContent
    });
  } catch (error) {
    console.error('Error updating homepage content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update homepage content'
    });
  }
});

// GET /api/homepage/public - Get homepage content for public access (customers)
// router.get('/public', async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       data: homepageContent
//     });
//   } catch (error) {
//     console.error('Error fetching public homepage content:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch homepage content'
//     });
//   }
// });

// POST /api/admin/homepage/reset - Reset homepage to default content
router.post('/reset', auth, adminCheck, async (req, res) => {
  try {
    homepageContent = {
      hero: {
        title: "Welcome to Seven Four Clothing",
        subtitle: "Discover our latest collection of premium streetwear designed for comfort and style.",
        buttonText: "Shop Now",
        backgroundImage: "/api/placeholder/1200/600"
      },
      featuredProducts: [
        {
          id: 1,
          name: "Classic T-Shirt",
          price: "₱999.00",
          image: "/api/placeholder/250/200",
          position: 1,
          category: "t-shirts"
        },
        {
          id: 2,
          name: "Denim Jacket",
          price: "₱2,499.00",
          image: "/api/placeholder/250/200",
          position: 2,
          category: "jackets"
        },
        {
          id: 3,
          name: "Summer Hoodie",
          price: "₱1,799.00",
          image: "/api/placeholder/250/200",
          position: 3,
          category: "hoodies"
        },
        {
          id: 4,
          name: "Casual Shorts",
          price: "₱899.00",
          image: "/api/placeholder/250/200",
          position: 4,
          category: "shorts"
        }
      ]
    };

    console.log('Homepage content reset to default by admin:', req.user.email);

    res.json({
      success: true,
      message: 'Homepage content reset to default',
      data: homepageContent
    });
  } catch (error) {
    console.error('Error resetting homepage content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset homepage content'
    });
  }
});

module.exports = router;
