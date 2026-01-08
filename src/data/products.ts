import amorFatiImg from '@/assets/product-1.jpg';
import evolveImg from '@/assets/product-2.jpg';
import spartanzImg from '@/assets/product-3.jpg';
import amertaImg from '@/assets/product-4.jpg';

export const products = [
  {
    id: 'amor-fati',
    slug: 'amor-fati',
    name: 'Amor Fati',
    size_ml: 35,
    price: 110000,
    category: 'signature',
    is_featured: true,
    image: amorFatiImg,
    description:
      'A bold and captivating fragrance that opens with vibrant spices and fruits, evolving into a sensual musky heart and woody base.',
    notes: {
      top: ['Pink Pepper', 'Litchi', 'Bergamot', 'Nutmeg', 'Pineapple'],
      middle: ['Carnation', 'Lily of the Valley', 'Musk', 'Red Berries'],
      base: ['Ambroxan', 'Vanilla', 'Cedar', 'Woody Notes'],
    },
  },
  {
    id: 'evolve',
    slug: 'evolve',
    name: 'Evolve',
    size_ml: 35,
    price: 100000,
    category: 'floral',
    is_featured: true,
    image: evolveImg,
    description:
      'A smooth and elegant floral gourmand fragrance with a creamy vanilla base and a soft milky finish.',
    notes: {
      top: ['Blackberry', 'Neroli', 'Apple'],
      middle: ['Tuberose', 'Orange Blossom', 'Rose', 'Jasmine', 'Peony'],
      base: ['Milk Mousse', 'Black Vanilla', 'Patchouli', 'Vanilla Bean', 'Amber'],
    },
  },
  {
    id: 'spartanz',
    slug: 'spartanz',
    name: 'Spartanz',
    size_ml: 35,
    price: 115000,
    category: 'fresh',
    is_featured: true,
    image: spartanzImg,
    description:
      'A powerful and masculine scent with fresh citrus opening, earthy patchouli heart, and smoky woody base.',
    notes: {
      top: ['Bergamot', 'Black Currant', 'Apple', 'Lemon', 'Pink Pepper'],
      middle: ['Pineapple', 'Patchouli'],
      base: ['Birch', 'Musk', 'Oak Moss', 'Cedarwood'],
    },
  },
  {
    id: 'amerta',
    slug: 'amerta',
    name: 'Amerta',
    size_ml: 35,
    price: 105000,
    category: 'floral',
    is_featured: false,
    image: amertaImg,
    description:
      'A radiant white floral fragrance blending soft florals with a warm musky vanilla dry-down.',
    notes: {
      top: ['Orange Blossom', 'Bergamot', 'Pear'],
      middle: ['Jasmine', 'Ylang-Ylang', 'Tuberose'],
      base: ['Musk', 'Vanilla', 'Patchouli'],
    },
  },
];
