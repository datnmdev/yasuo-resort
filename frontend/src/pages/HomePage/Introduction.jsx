import { Button } from '@ui/button';
import { Card, CardContent } from '@ui/card';
import { motion } from 'framer-motion';
import { Car, Coffee, MapPin, Wifi } from 'lucide-react';
import { Link } from 'react-router';

const Introduction = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      {/* About Section with Images */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-5xl font-bold text-gray-800 mb-4">Welcome to Paradise</h2>
            <p className="text-gray-600 text-lg max-w-5xl mx-auto">
              Nestled on the pristine shores of a tropical paradise, our resort offers an unparalleled escape from the
              ordinary. With breathtaking ocean views, world-class amenities, and exceptional service, we create
              unforgettable experiences that will leave you refreshed and renewed.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img src="/homepage-image-1.jpg" alt="Paradise Resort Overview" className="rounded-lg shadow-xl" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Your Perfect Getaway Awaits</h3>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Discover a world where luxury meets nature, where every detail has been carefully crafted to ensure
                  your comfort and satisfaction. Our resort features elegantly designed accommodations, each offering
                  stunning views and modern amenities.
                </p>
                <p>
                  {`Whether you're seeking adventure or relaxation, romance or family fun, our dedicated team is committed
                    to making your stay extraordinary. From sunrise yoga sessions to sunset cocktails, every moment is
                    designed to create lasting memories.`}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Image Gallery */}
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} className="relative group">
              <img
                src="/homepage-image-2.jpg"
                alt="Beachfront View"
                className="rounded-lg shadow-lg w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
            <motion.div variants={fadeInUp} className="relative group">
              <img
                src="/homepage-image-3.jpg"
                alt="Luxury Pool"
                className="rounded-lg shadow-lg w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
            <motion.div variants={fadeInUp} className="relative group">
              <img
                src="/homepage-image-4.jpg"
                alt="Tropical Gardens"
                className="rounded-lg shadow-lg w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Paradise Resort?</h2>
            <p className="text-gray-600 text-lg">Experience the finest amenities and services</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { icon: MapPin, title: 'Prime Location', desc: 'Beachfront paradise setting' },
              { icon: Wifi, title: 'Free WiFi', desc: 'High-speed internet 24/7' },
              { icon: Car, title: 'Free Parking', desc: 'Secure and convenient' },
              { icon: Coffee, title: 'Fine Dining', desc: '5-star restaurant experience' },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center bg-white p-6 hover:shadow-lg transition-shadow border-teal-100">
                  <CardContent className="pt-6">
                    <feature.icon className="w-12 h-12 text-teal-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0D584D] to-[#0c3336] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-4">Ready for Your Paradise Escape?</h2>
            <p className="text-teal-100 mb-8 text-lg max-w-2xl mx-auto">
              Book your stay today and discover why Paradise Resort is the perfect destination for your next getaway.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 text-lg">
                <Link to="/rooms">Book Now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-teal-600 bg-transparent px-8 py-3 text-lg"
              >
                <Link to="/about">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Introduction;
