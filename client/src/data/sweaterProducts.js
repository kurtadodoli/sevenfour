// src/data/sweaterProducts.js

// Import sweater images
// Ascend
import ascend1 from '../assets/images/sweaters/ascend/ascend1.jpg';
import ascend2 from '../assets/images/sweaters/ascend/ascend2.jpg';
import ascend3 from '../assets/images/sweaters/ascend/ascend3.jpg';

// Love Your Flaws
import loveYourFlaws1 from '../assets/images/sweaters/love-your-flaws/love-your-flaws1.jpg';
import loveYourFlaws2 from '../assets/images/sweaters/love-your-flaws/love-your-flaws2.jpg';
import loveYourFlaws3 from '../assets/images/sweaters/love-your-flaws/love-your-flaws3.jpg';

// Export product data
export const sweaterProducts = [
  {
    id: 'ascend',
    name: '"Ascend" Sweater',
    price: 1489,
    category: 'Sweaters',
    colors: ['Light Gray'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      ascend1,
      ascend2,
      ascend3
    ]
  },
  {
    id: 'love-your-flaws-sweater',
    name: '"Love Your Flaws" Sweater',
    price: 1259,
    category: 'Sweaters',
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      loveYourFlaws1,
      loveYourFlaws2,
      loveYourFlaws3
    ]
  }
];