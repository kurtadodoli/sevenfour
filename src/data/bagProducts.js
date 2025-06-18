// src/data/bagProducts.js

// Import bag images
// Belt Bag
import beltBag1 from '../assets/images/bags/belt-bag/belt-bag1.jpg';
import beltBag2 from '../assets/images/bags/belt-bag/belt-bag2.jpg';
import beltBag3 from '../assets/images/bags/belt-bag/belt-bag3.jpg';
import beltBag4 from '../assets/images/bags/belt-bag/belt-bag4.jpg';
import beltBag5 from '../assets/images/bags/belt-bag/belt-bag5.jpg';
import beltBag6 from '../assets/images/bags/belt-bag/belt-bag6.jpg';

// Sling Bag
import slingBag1 from '../assets/images/bags/sling-bag/sling-bag1.jpg';
import slingBag2 from '../assets/images/bags/sling-bag/sling-bag2.jpg';
import slingBag3 from '../assets/images/bags/sling-bag/sling-bag3.jpg';
import slingBag4 from '../assets/images/bags/sling-bag/sling-bag4.jpg';
import slingBag5 from '../assets/images/bags/sling-bag/sling-bag5.jpg';

// Export product data
export const bagProducts = [
  {
    id: 'belt-bag',
    name: 'Belt Bag',
    price: 989,
    category: 'Bags',
    colors: ['Black'],
    sizes: ['One Size'],
    images: [
      beltBag1,
      beltBag2,
      beltBag3,
      beltBag4,
      beltBag5,
      beltBag6
    ]
  },
  {
    id: 'sling-bag',
    name: 'Sling Bag',
    price: 759,
    category: 'Bags',
    colors: ['Black'],
    sizes: ['One Size'],
    images: [
      slingBag1,
      slingBag2,
      slingBag3,
      slingBag4,
      slingBag5
    ]
  }
];