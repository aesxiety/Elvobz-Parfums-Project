import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BespokeSection } from '@/components/home/BespokeSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

const Index = () => {
  return (
    <Layout >
      <Hero />
      <FeaturedProducts />
      <BespokeSection />
      <TestimonialsSection />
    </Layout>
  );
};

export default Index;
