import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import aboutImage from '@/assets/about-brand.jpg';

const values = [
  {
    title: 'Artisan Craftsmanship',
    description: 'Every fragrance is handcrafted by our master perfumer using traditional techniques passed down through generations.',
  },
  {
    title: 'Rare Ingredients',
    description: 'We source only the finest natural ingredients from trusted growers around the world, from Bulgarian roses to Indian sandalwood.',
  },
  {
    title: 'Personal Connection',
    description: 'We believe that a fragrance should tell your unique story. That\'s why we offer bespoke consultations to create your signature scent.',
  },
  {
    title: 'Sustainable Luxury',
    description: 'We\'re committed to ethical sourcing and sustainable practices, ensuring that luxury doesn\'t come at the cost of our planet.',
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={aboutImage}
            alt="Our atelier"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-noir/80" />
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <p className="text-primary uppercase tracking-[0.3em] text-sm font-medium mb-4">
              Our Story
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold mb-6">
              The Art of{' '}
              <span className="text-gradient-gold italic">Fine Perfumery</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-6">
                Where Tradition Meets
                <br />
                <span className="text-gradient-gold">Modern Artistry</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in Jakarta, Maison Élixir was born from a passion for the 
                  ancient art of perfumery. Our founder, after years of studying with 
                  master perfumers in Grasse, France, returned home with a dream: to 
                  create a house that honors traditional craftsmanship while embracing 
                  the rich aromatic heritage of Southeast Asia.
                </p>
                <p>
                  Each fragrance in our collection is a labor of love, taking months 
                  or even years to perfect. We believe that true luxury lies in the 
                  details—the quality of ingredients, the precision of composition, 
                  and the emotion it evokes.
                </p>
                <p>
                  Today, Maison Élixir stands as a testament to the belief that 
                  perfume is more than a product—it's an art form, a memory, 
                  a signature that stays with you long after you leave.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-sm">
                <img
                  src={aboutImage}
                  alt="Master perfumer at work"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-primary/30 rounded-sm -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The principles that guide every creation at Maison Élixir.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 border border-border rounded-sm bg-background"
              >
                <div className="w-12 h-1 bg-gradient-gold mb-6" />
                <h3 className="font-display text-xl font-medium mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
