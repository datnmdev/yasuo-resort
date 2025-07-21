import { Button } from '@ui/button';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';

const heroSlides = [
  {
    image: '/homepage-image-1.jpg',
    title: 'Paradise Resort',
    subtitle: 'Your Ultimate Tropical Getaway',
    description:
      'Experience luxury and tranquility in our pristine beachfront resort surrounded by lush tropical gardens',
  },
  {
    image: '/homepage-image-2.jpg',
    title: 'Luxury Accommodations',
    subtitle: 'Comfort Meets Elegance',
    description:
      'Indulge in our beautifully appointed rooms and suites, each designed to provide the perfect sanctuary',
  },
  {
    image: '/homepage-image-3.jpg',
    title: 'World-Class Amenities',
    subtitle: 'Everything You Need',
    description:
      'From infinity pools to spa treatments, enjoy premium facilities designed for your ultimate relaxation',
  },
];

const Slide = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    // Hero Carousel Section
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      {/* Carousel Images */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}></div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="sm"
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 border-white/30 text-white hover:bg-white/30"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 border-white/30 text-white hover:bg-white/30"
        onClick={nextSlide}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Hero Content */}
      <motion.div
        className="relative z-20 text-center text-white px-4 max-w-4xl"
        key={currentSlide}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-teal-200 via-white to-teal-200 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {heroSlides[currentSlide].title}
        </motion.h1>
        <motion.h2
          className="text-3xl md:text-4xl mb-4 font-semibold"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          {heroSlides[currentSlide].subtitle}
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {heroSlides[currentSlide].description}
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Button size="lg" className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 text-lg">
            <Link to="/rooms">Explore Rooms</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-teal-600 bg-transparent px-8 py-3 text-lg"
          >
            <Link to="/about">Learn More</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default Slide;
