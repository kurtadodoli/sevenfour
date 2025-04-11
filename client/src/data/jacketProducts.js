// src/data/jacketProducts.js

// Import jacket images
// Love Never Fails
import loveNeverFails1 from '../assets/images/jackets/loveneverfails/loveneverfails-jacket1.jpg';
import loveNeverFails2 from '../assets/images/jackets/loveneverfails/loveneverfails-jacket2.jpg';
import loveNeverFails3 from '../assets/images/jackets/loveneverfails/loveneverfails-jacket3.jpg';
import loveNeverFails4 from '../assets/images/jackets/loveneverfails/loveneverfails-jacket4.jpg';
import loveNeverFails5 from '../assets/images/jackets/loveneverfails/loveneverfails-jacket5.jpg';
import loveNeverFails6 from '../assets/images/jackets/loveneverfails/loveneverfails-jacket6.jpg';
import loveNeverFails7 from '../assets/images/jackets/loveneverfails/loveneverfails-jacket7.jpg';
import loveNeverFails8 from '../assets/images/jackets/loveneverfails/loveneverfails-jacket8.jpg';

// SF Work Jacket
import sfWorkJacket1 from '../assets/images/jackets/sf-work-jacket/sf-work-jacket1.jpg';
import sfWorkJacket2 from '../assets/images/jackets/sf-work-jacket/sf-work-jacket2.jpg';
import sfWorkJacket3 from '../assets/images/jackets/sf-work-jacket/sf-work-jacket3.jpg';
import sfWorkJacket4 from '../assets/images/jackets/sf-work-jacket/sf-work-jacket4.jpg';
import sfWorkJacket5 from '../assets/images/jackets/sf-work-jacket/sf-work-jacket5.jpg';
import sfWorkJacket6 from '../assets/images/jackets/sf-work-jacket/sf-work-jacket6.jpg';
import sfWorkJacket7 from '../assets/images/jackets/sf-work-jacket/sf-work-jacket7.jpg';
import sfWorkJacket8 from '../assets/images/jackets/sf-work-jacket/sf-work-jacket8.jpg';

// Export product data
export const jacketProducts = [
  {
    id: 'love-never-fails',
    name: '"Love Never Fails" Jacket',
    price: 1500,
    category: 'Jackets',
    colors: ['Blue'],
    sizes: ['S', 'M', 'L'],
    images: [
      loveNeverFails1,
      loveNeverFails2,
      loveNeverFails3,
      loveNeverFails4,
      loveNeverFails5,
      loveNeverFails6,
      loveNeverFails7,
      loveNeverFails8
    ]
  },
  {
    id: 'sf-work-jacket',
    name: '"SF Work" Jacket',
    price: 1800,
    category: 'Jackets',
    colors: ['Beige'],
    sizes: ['S', 'M', 'L'],
    images: [
      sfWorkJacket1,
      sfWorkJacket2,
      sfWorkJacket3,
      sfWorkJacket4,
      sfWorkJacket5,
      sfWorkJacket6,
      sfWorkJacket7,
      sfWorkJacket8
    ]
  }
];