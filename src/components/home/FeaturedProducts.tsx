import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';

const featuredProducts = [
  {
    id: 1,
    name: 'Amor Fati',
    price: 110000,
    image: product1,
    notes: ['Pink Pepper', 'Litchi', 'Bergamot'],
  },
  {
    id: 2,
    name: 'Evolve',
    price: 110000,
    image: product2,
    notes: ['Blackberry', 'Neroli', 'Apple'],
  },
  {
    id: 3,
    name: 'Spartanz',
    price: 110000,
    image: product3,
    notes: ['Bergamot', 'Blackcurrant', 'Apple'],
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

export function FeaturedProducts() {
  return (
    <section className="py-24 bg-gradient-noir">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary uppercase tracking-[0.3em] text-sm font-medium mb-4">
            Signature Collection
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            Essential Elegance
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Parfum pilihan yang mendefinisikan karakter dan gaya personal
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-sm bg-card border border-border">
                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Quick View Button */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <Link to={`/products/${product.id}`}>
                    <Button className="w-full bg-primary/90 backdrop-blur text-primary-foreground hover:bg-primary">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Product Info */}
              <div className="mt-4 text-center">
                <h3 className="font-display text-xl font-medium mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {product.notes.join(' · ')}
                </p>
                <p className="text-primary font-medium">{formatPrice(product.price)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/products">
            <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10 group">
              View All Collection
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
