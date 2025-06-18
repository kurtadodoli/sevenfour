// src/data/headwearProducts.js

// Import headwear images
import cap1 from '../assets/images/headwear/cap/cap1.jpg';
import cap2 from '../assets/images/headwear/cap/cap2.jpg';
import cap3 from '../assets/images/headwear/cap/cap3.jpg';

import beanie1 from '../assets/images/headwear/beanie/beanie1.jpg';
import beanie2 from '../assets/images/headwear/beanie/beanie2.jpg';
import beanie3 from '../assets/images/headwear/beanie/beanie3.jpg';

import bucketHat1 from '../assets/images/headwear/buckethat/buckethat1.jpg';
import bucketHat2 from '../assets/images/headwear/buckethat/buckethat2.jpg';
import bucketHat3 from '../assets/images/headwear/buckethat/buckethat3.jpg';

export const headwearProducts = [
  {
    id: 'sf-cap',
    name: 'SF Cap',
    price: 389,
    category: 'Headwear',
    colors: ['Black'],
    sizes: ['One Size'],
    images: [
      cap1,
      cap2,
      cap3
    ],
    description: 'Classic SF Cap featuring our signature logo. Perfect for everyday wear with adjustable fit.'
  },
  {
    id: 'sf-beanie',
    name: 'SF Beanie',
    price: 389,
    category: 'Headwear',
    colors: ['Black', 'Gray'],
    sizes: ['One Size'],
    images: [
      beanie1,
      beanie2,
      beanie3
    ],
    description: 'Cozy SF Beanie made from premium materials to keep you warm while looking stylish.'
  },
  {
    id: 'sf-bucket-hat',
    name: 'SF Bucket Hat',
    price: 389,
    category: 'Headwear',
    colors: ['Black', 'Gray'],
    sizes: ['One Size'],
    images: [
      bucketHat1,
      bucketHat2,
      bucketHat3
    ],
    description: 'Trendy SF Bucket Hat perfect for any season. Features our embroidered logo and durable construction.'
  }
];