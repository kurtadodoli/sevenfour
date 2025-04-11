// src/data/hoodieProducts.js

// Import hoodie images
// I Got Your Back
import iGotYourBack1 from '../assets/images/hoodies/i-got-your-back/i-got-your-back1.jpg';
import iGotYourBack2 from '../assets/images/hoodies/i-got-your-back/i-got-your-back2.jpg';
import iGotYourBack3 from '../assets/images/hoodies/i-got-your-back/i-got-your-back3.jpg';
import iGotYourBack4 from '../assets/images/hoodies/i-got-your-back/i-got-your-back4.jpg';
import iGotYourBack5 from '../assets/images/hoodies/i-got-your-back/i-got-your-back5.jpg';
import iGotYourBack6 from '../assets/images/hoodies/i-got-your-back/i-got-your-back6.jpg';
import iGotYourBack7 from '../assets/images/hoodies/i-got-your-back/i-got-your-back7.jpg';
import iGotYourBack8 from '../assets/images/hoodies/i-got-your-back/i-got-your-back8.jpg';
import iGotYourBack9 from '../assets/images/hoodies/i-got-your-back/i-got-your-back9.jpg';

// Strangers To Family
import strangersToFamily1 from '../assets/images/hoodies/strangerstofamily/strangerstofamily-hoodie1.jpg';
import strangersToFamily2 from '../assets/images/hoodies/strangerstofamily/strangerstofamily-hoodie2.jpg';

// Tangerine
import tangerineHoodie1 from '../assets/images/hoodies/tangerine-hoodie/tangerine-hoodie1.jpg';
import tangerineHoodie2 from '../assets/images/hoodies/tangerine-hoodie/tangerine-hoodie2.jpg';
import tangerineHoodie3 from '../assets/images/hoodies/tangerine-hoodie/tangerine-hoodie3.jpg';

// Export product data
export const hoodieProducts = [
  {
    id: 'i-got-your-back',
    name: '"I Got Your Back" Hoodie',
    price: 1200,
    category: 'Hoodies',
    colors: ['Black', 'Beige'],
    sizes: ['S', 'M', 'L'],
    images: [
      iGotYourBack1,
      iGotYourBack2,
      iGotYourBack3,
      iGotYourBack4,
      iGotYourBack5,
      iGotYourBack6,
      iGotYourBack7,
      iGotYourBack8,
      iGotYourBack9
    ]
  },
  {
    id: 'strangers-to-family',
    name: '"Strangers To Family" Hoodie',
    price: 1500,
    category: 'Hoodies',
    colors: ['Black', 'Gray'],
    sizes: ['S', 'M', 'L'],
    images: [
      strangersToFamily1,
      strangersToFamily2
    ]
  },
  {
    id: 'tangerine-hoodie',
    name: '"Tangerine" Hoodie',
    price: 1000,
    category: 'Hoodies',
    colors: ['Black', 'Gray'],
    sizes: ['S', 'M', 'L'],
    images: [
      tangerineHoodie1,
      tangerineHoodie2,
      tangerineHoodie3
    ]
  }
];