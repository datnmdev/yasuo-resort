'use client';

import { Card, CardContent } from '@ui/card';
import { motion } from 'framer-motion';
import { MapPin, Heart, Leaf, Shield, Star } from 'lucide-react';

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const values = [
    {
      icon: Heart,
      title: 'Exceptional Service',
      description:
        'We are committed to providing personalized service that exceeds expectations, ensuring every guest feels valued and cared for throughout their stay.',
    },
    {
      icon: Leaf,
      title: 'Environmental Responsibility',
      description:
        'Our commitment to sustainable tourism practices helps preserve the natural beauty that makes our destination so special for future generations.',
    },
    {
      icon: Shield,
      title: 'Safety & Quality',
      description:
        'We maintain the highest standards of safety and quality in all our facilities and services, giving you peace of mind during your vacation.',
    },
    {
      icon: Star,
      title: 'Memorable Experiences',
      description:
        'Every detail is carefully crafted to create unforgettable moments that will become cherished memories for years to come.',
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-4xl mx-auto" {...fadeInUp}>
            <h1 className="text-5xl font-bold mb-6">About Yasuo Resort</h1>
            <p className="text-xl text-teal-100 leading-relaxed">
              Discover the story behind our tropical paradise, where luxury meets nature and every guest becomes part of
              our extended family. Experience the perfect blend of comfort, adventure, and tranquility.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Yasuo Resort was born from a dream to create a sanctuary where travelers could escape the ordinary and
                  immerse themselves in the extraordinary beauty of tropical paradise. Founded in 2014, our resort began
                  as a vision to harmoniously blend luxury hospitality with the pristine natural environment.
                </p>
                <p>
                  What started as a boutique property with 20 rooms has grown into a world-class destination featuring
                  over 150 elegantly appointed accommodations. Each expansion has been carefully planned to preserve the
                  intimate atmosphere and environmental integrity that makes our resort truly special.
                </p>
                <p>
                  Today, Yasuo Resort stands as a testament to sustainable luxury tourism, where guests can enjoy
                  premium amenities while knowing their stay contributes to the preservation of our beautiful natural
                  surroundings and supports the local community.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img src="/homepage-image-6.jpg" alt="Yasuo Resort Story" className="rounded-lg shadow-xl" />
              <div className="absolute -bottom-6 -left-6 bg-teal-600 text-white p-6 rounded-lg">
                <div className="text-2xl font-bold">2014</div>
                <div className="text-teal-100">Established</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-teal-50">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Mission & Vision</h2>
            <p className="text-gray-600 text-lg">Guiding principles that shape everything we do</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              className="bg-white p-8 rounded-lg shadow-lg"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-teal-600 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide an exceptional tropical resort experience that creates lasting memories while promoting
                environmental sustainability and supporting local communities. We strive to exceed guest expectations
                through personalized service, luxurious amenities, and authentic cultural experiences.
              </p>
            </motion.div>
            <motion.div
              className="bg-white p-8 rounded-lg shadow-lg"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-teal-600 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be recognized as the premier sustainable luxury resort destination, setting the standard for
                environmental responsibility and community engagement while delivering unparalleled guest experiences
                that inspire and rejuvenate the human spirit.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-gray-600 text-lg">The values that guide every aspect of our service</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center p-6 h-full hover:shadow-lg transition-shadow border-teal-100">
                  <CardContent className="pt-6">
                    <value.icon className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">{value.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 bg-teal-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img src="/homepage-image-3.jpg" alt="Yasuo Resort Location" className="rounded-lg shadow-xl" />
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-lg">
                <MapPin className="w-6 h-6 text-teal-600 mb-2" />
                <div className="text-sm font-semibold">Phu Quoc Island, Vietnam</div>
              </div>
            </motion.div>
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Prime Location</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {`Yasuo Resort is strategically located on the pristine shores of Phu Quoc Island, Vietnam's largest
                  island known as the "Pearl of Vietnam." Our beachfront location offers direct access to 2 kilometers
                  of private white sand beach, surrounded by lush tropical rainforest.`}
                </p>
                <p>
                  {`The resort's position provides easy access to the island's most popular attractions while maintaining
                  a sense of seclusion and tranquility. Guests can explore nearby fishing villages, national parks, and
                  cultural sites, or simply relax and enjoy the natural beauty that surrounds us.`}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-teal-600 mr-2" />
                    15 min from airport
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-teal-600 mr-2" />5 min to town center
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-teal-600 mr-2" />
                    Private beach access
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-teal-600 mr-2" />
                    National park nearby
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Commitment to Sustainability</h2>
            <p className="text-gray-600 text-lg">Preserving paradise for future generations</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img src="/homepage-image-3.jpg" alt="Environmental Conservation" className="rounded-lg shadow-lg mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Environmental Conservation</h3>
              <p className="text-gray-600 text-sm">
                We actively participate in coral reef restoration, beach cleanup initiatives, and wildlife protection
                programs to preserve the natural ecosystem.
              </p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <img src="/homepage-image-4.jpg" alt="Local Community" className="rounded-lg shadow-lg mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Community Support</h3>
              <p className="text-gray-600 text-sm">
                We source locally, employ from the community, and support local artisans and cultural preservation
                efforts throughout the region.
              </p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <img src="/homepage-image-5.jpg" alt="Green Practices" className="rounded-lg shadow-lg mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Green Practices</h3>
              <p className="text-gray-600 text-sm">
                Solar energy, water conservation, waste reduction, and organic gardens are just some of our eco-friendly
                initiatives.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
