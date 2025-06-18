// src/data/jerseyProducts.js

// Import jersey images
// SF Hockey Jersey
import sfHockeyJersey1 from '../assets/images/jerseys/sf-hockey-jersey/sf-hockey-jersey1.jpg';
import sfHockeyJersey2 from '../assets/images/jerseys/sf-hockey-jersey/sf-hockey-jersey2.jpg';

// SF World Series Hockey Jersey
import sfWorldSeriesHockeyJersey1 from '../assets/images/jerseys/sf-worldseries-hockey-jersey/sf-worldseries-hockey-jersey1.jpg';
import sfWorldSeriesHockeyJersey2 from '../assets/images/jerseys/sf-worldseries-hockey-jersey/sf-worldseries-hockey-jersey2.jpg';
import sfWorldSeriesHockeyJersey3 from '../assets/images/jerseys/sf-worldseries-hockey-jersey/sf-worldseries-hockey-jersey3.jpg';
import sfWorldSeriesHockeyJersey4 from '../assets/images/jerseys/sf-worldseries-hockey-jersey/sf-worldseries-hockey-jersey4.jpg';
import sfWorldSeriesHockeyJersey5 from '../assets/images/jerseys/sf-worldseries-hockey-jersey/sf-worldseries-hockey-jersey5.jpg';
import sfWorldSeriesHockeyJersey6 from '../assets/images/jerseys/sf-worldseries-hockey-jersey/sf-worldseries-hockey-jersey6.jpg';
import sfWorldSeriesHockeyJersey7 from '../assets/images/jerseys/sf-worldseries-hockey-jersey/sf-worldseries-hockey-jersey7.jpg';
import sfWorldSeriesHockeyJersey8 from '../assets/images/jerseys/sf-worldseries-hockey-jersey/sf-worldseries-hockey-jersey8.jpg';

// Export product data
export const jerseyProducts = [
  {
    id: 'sf-hockey-jersey',
    name: '"SF Hockey" Jersey',
    price: 1189,
    category: 'Jerseys',
    colors: ['Black', 'Navy Blue'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      sfHockeyJersey1,
      sfHockeyJersey2
    ]
  },
  {
    id: 'sf-worldseries-hockey-jersey',
    name: '"SF World Series Hockey" Jersey',
    price: 1189,
    category: 'Jerseys',
    colors: ['Black', 'White'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      sfWorldSeriesHockeyJersey1,
      sfWorldSeriesHockeyJersey2,
      sfWorldSeriesHockeyJersey3,
      sfWorldSeriesHockeyJersey4,
      sfWorldSeriesHockeyJersey5,
      sfWorldSeriesHockeyJersey6,
      sfWorldSeriesHockeyJersey7,
      sfWorldSeriesHockeyJersey8
    ]
  }
];