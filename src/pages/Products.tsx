import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { products as productData } from '@/data/products';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    'all',
    ...new Set(productData.map(p => p.category)),
  ];

  const filteredProducts =
    activeCategory === 'all'
      ? productData
      : productData.filter(p => p.category === activeCategory);

  return (
    <Layout>
      {/* Category Filter */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4 flex justify-center gap-4 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm uppercase tracking-wide ${
                activeCategory === category
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="border rounded-sm overflow-hidden bg-card">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition group-hover:scale-110"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-display mb-2">
                    {product.name}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-primary font-semibold">
                      {formatPrice(product.price)}
                    </span>

                    <a href={`/products/${product.slug}`}>
                      <Button size="sm" variant="outline">
                        Detail
                      </Button>
                    </a>
                  </div>

                  {/* {product.marketplace_link && (
                    <a
                      href={product.marketplace_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block"
                    >
                      <Button size="sm" className="w-full">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Shop
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </a>
                  )} */}
                  
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
