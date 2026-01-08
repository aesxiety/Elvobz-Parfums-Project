import { useParams, Link } from 'react-router-dom';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <section className="pt-28 pb-20 container mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* IMAGE */}
        <div className="rounded-sm overflow-hidden border border-border">
          <img
            src={product.image}
            alt={product.name}
            className="w-full object-cover"
          />
        </div>

        {/* INFO */}
        <div>
          <Link to="/products" className="text-sm text-muted-foreground hover:underline">
            ← Back to collection
          </Link>

          <h1 className="font-display text-4xl mt-4 mb-2">
            {product.name}
          </h1>

          <p className="text-muted-foreground mb-4">
            {product.description}
          </p>

          <p className="text-xl font-semibold text-primary mb-6">
            {formatPrice(product.price)} · {product.size_ml}ml
          </p>

          {/* NOTES ACCORDION */}
          <Accordion type="single" collapsible className="mb-8">
            <AccordionItem value="top">
              <AccordionTrigger>Top Notes</AccordionTrigger>
              <AccordionContent>
                {product.notes.top.join(', ')}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="middle">
              <AccordionTrigger>Middle Notes</AccordionTrigger>
              <AccordionContent>
                {product.notes.middle.join(', ')}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="base">
              <AccordionTrigger>Base Notes</AccordionTrigger>
              <AccordionContent>
                {product.notes.base.join(', ')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* CTA */}
          <Button size="lg" className="w-full bg-gradient-gold text-primary-foreground">
            Order via WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
