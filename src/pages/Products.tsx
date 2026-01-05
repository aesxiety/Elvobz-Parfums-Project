import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  size_ml: number | null;
  image_url: string | null;
  category: string | null;
  notes: string[] | null;
  marketplace_link: string | null;
}

// Default products for display
const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Amber Essence',
    description: 'A warm, sensual fragrance featuring rich amber notes layered with vanilla and precious sandalwood.',
    price: 2450000,
    size_ml: 50,
    image_url: product1,
    category: 'signature',
    notes: ['Amber', 'Vanilla', 'Sandalwood'],
    marketplace_link: '#',
  },
  {
    id: '2',
    name: 'Rose Nocturne',
    description: 'An enchanting blend of Damascus rose with mysterious oud undertones and soft musk.',
    price: 1950000,
    size_ml: 50,
    image_url: product2,
    category: 'floral',
    notes: ['Damascus Rose', 'Oud', 'Musk'],
    marketplace_link: '#',
  },
  {
    id: '3',
    name: 'Oud Royale',
    description: 'A majestic composition of rare oud wood, saffron threads, and supple leather.',
    price: 3250000,
    size_ml: 50,
    image_url: product3,
    category: 'oriental',
    notes: ['Oud', 'Saffron', 'Leather'],
    marketplace_link: '#',
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];
  
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter((p) => p.category === activeCategory);

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-noir">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="text-primary uppercase tracking-[0.3em] text-sm font-medium mb-4">
              Our Collection
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold mb-6">
              Discover Your{' '}
              <span className="text-gradient-gold italic">Essence</span>
            </h1>
            <p className="text-muted-foreground">
              Each fragrance is a masterpiece, carefully crafted with the finest 
              ingredients from around the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-center gap-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm uppercase tracking-wide transition-colors ${
                  activeCategory === category
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card border border-border rounded-sm overflow-hidden">
                  {/* Image */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image_url || product1}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display text-xl font-medium">{product.name}</h3>
                      <span className="text-xs uppercase tracking-wide text-primary bg-primary/10 px-2 py-1 rounded">
                        {product.size_ml}ml
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {product.notes && product.notes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.notes.map((note) => (
                          <span
                            key={note}
                            className="text-xs text-muted-foreground border border-border px-2 py-1 rounded-sm"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-lg font-semibold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      
                      {product.marketplace_link && (
                        <a
                          href={product.marketplace_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Shop
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
