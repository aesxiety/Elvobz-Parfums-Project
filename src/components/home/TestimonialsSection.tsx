import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Demo testimonials data (would come from database in production)
const testimonials = [
  {
    id: 1,
    name: 'Sarah Wijaya',
    videoUrl: 'https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDI0NDcxNzU1NjU3ODU2?story_media_id=3596568827034841227_70560378555&igsh=eXd1cnl5a3czOWE3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    quote: 'The custom perfume they created for me is absolutely divine. It\'s become my signature scent.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Tanaka',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    quote: 'An unforgettable experience. The attention to detail in crafting my fragrance was remarkable.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Amanda Chen',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    quote: 'I\'ve never felt more special. The bespoke consultation was intimate and luxurious.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setPlayingVideo(null);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setPlayingVideo(null);
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary uppercase tracking-[0.3em] text-sm font-medium mb-4">
            Client Stories
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            Voices of Elegance
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Hear from those who have experienced the art of bespoke perfumery.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            {/* Video/Thumbnail */}
            <div className="relative aspect-square rounded-sm overflow-hidden">
              {playingVideo === activeTestimonial.id ? (
                <iframe
                  src={`${activeTestimonial.videoUrl}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={activeTestimonial.thumbnailUrl}
                    alt={activeTestimonial.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-noir/40 flex items-center justify-center">
                    <button
                      onClick={() => setPlayingVideo(activeTestimonial.id)}
                      className="p-4 bg-primary rounded-full text-primary-foreground hover:scale-110 transition-transform"
                    >
                      <Play className="h-8 w-8 fill-current" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Content */}
            <div>
              <div className="flex mb-4">
                {[...Array(activeTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                ))}
              </div>
              <blockquote className="font-display text-2xl font-medium italic mb-6 leading-relaxed">
                "{activeTestimonial.quote}"
              </blockquote>
              <p className="text-lg font-medium">{activeTestimonial.name}</p>
              <p className="text-sm text-muted-foreground">Verified Client</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-10">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    setPlayingVideo(null);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
