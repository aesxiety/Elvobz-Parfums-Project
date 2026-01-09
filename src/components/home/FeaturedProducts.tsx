import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { products } from '@/data/products';

const featuredProducts = products.filter(p => p.is_featured);

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

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

                {/* Button */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <Link to={`/products/${product.slug}`}>
                    <Button className="w-full bg-primary/90 backdrop-blur">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4">
                <h3 className="font-display text-xl font-medium mb-1 text-center">
                  {product.name}
                </h3>

                {/* <p className="text-center text-sm text-muted-foreground mb-2">
                  {product.size_ml} ml · {formatPrice(product.price)}
                </p> */}

                {/* Notes Accordion */}
                {/* <Accordion type="single" collapsible className="mt-3">
                  <AccordionItem value="notes">
                    <AccordionTrigger className="text-sm">
                      Fragrance Notes
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">Top:</span>{' '}
                          {product.notes.top.join(', ')}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Middle:</span>{' '}
                          {product.notes.middle.join(', ')}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Base:</span>{' '}
                          {product.notes.base.join(', ')}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion> */}
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/products">
            <Button variant="outline" size="lg" className="group">
              View All Collection
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
