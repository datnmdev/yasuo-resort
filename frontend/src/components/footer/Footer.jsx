import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-36 pt-12">
        <div className="grid md:grid-cols-3 gap-24">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold">Yasuo Resort</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your ultimate tropical getaway with luxury accommodations and world-class service.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-teal-600 cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-teal-600 cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-teal-600 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="ml-16">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-teal-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-gray-400 hover:text-teal-600 transition-colors">
                  Rooms
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-teal-600 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-teal-600 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-teal-600" />
                <span className="text-gray-400">Phu Quoc Island, Vietnam</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-teal-600" />
                <span className="text-gray-400">0123456789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-teal-600" />
                <span className="text-gray-400">info@yasuoresort.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-4 py-4 text-center">
          <p className="text-gray-400">© 2024 Paradise Resort. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
