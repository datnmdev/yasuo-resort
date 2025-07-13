'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  CreditCard,
  Check,
  Plus,
  Minus,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';

export default function BookingConfirmationPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedServices, setSelectedServices] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;
  const { state } = useLocation();
  const room = state?.room;

  // Get all services
  const { data, isLoading } = useQuery({
    queryKey: ['services', currentPage, searchQuery],
    queryFn: () =>
      serviceApi.getServices({
        page: currentPage,
        limit,
        keyword: searchQuery,
      }),
    keepPreviousData: true,
  });

  // Pagination logic
  const totalPages = Math.ceil(availableServices.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const endIndex = startIndex + servicesPerPage;
  const currentServices = availableServices.slice(startIndex, endIndex);

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateRoomTotal = () => {
    if (!room) return 0;
    return room.type.pricePerDay * calculateNights();
  };

  const calculateServicesTotal = () => {
    return Object.entries(selectedServices).reduce((total, [serviceId, quantity]) => {
      const service = availableServices.find((s) => s.id === serviceId);
      return total + (service ? service.price * quantity : 0);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateRoomTotal() + calculateServicesTotal();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const updateServiceQuantity = (serviceId, change) => {
    setSelectedServices((prev) => {
      const currentQuantity = prev[serviceId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      if (newQuantity === 0) {
        const { [serviceId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [serviceId]: newQuantity };
    });
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  if (!room) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Room not found</h1>
          <p className="text-gray-600">Please select a room from the rooms page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div className="text-center mb-8" {...fadeInUp}>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Book Your Stay</h1>
          <p className="text-gray-600">Complete your reservation details</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Room Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Selected Room</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-semibold">
                      {room.type.name} - Room {room.roomNumber}
                    </div>
                    <div className="text-sm text-gray-600">{formatPrice(room.type.pricePerDay)} per night</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>Select Dates</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Check-in Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Check-out Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                {calculateNights() > 0 && (
                  <div className="md:col-span-2 text-sm text-gray-600">
                    Total nights: <span className="font-semibold">{calculateNights()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services Selection with Pagination */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                    <span>Additional Services</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{service.name}</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{service.id}</span>
                        </div>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <p className="text-green-600 font-semibold">{formatPrice(service.price)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateServiceQuantity(service.id, -1)}
                          disabled={!selectedServices[service.id]}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{selectedServices[service.id] || 0}</span>
                        <Button variant="outline" size="sm" onClick={() => updateServiceQuantity(service.id, 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-1 bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className={currentPage === page ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-1 bg-transparent"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <span>Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input id="cardName" placeholder="JOHN DOE" />
                </div>
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Summary */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-green-600">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800">Room Details</h4>
                  <div className="text-sm text-gray-600">
                    {room.type.name} - Room {room.roomNumber}
                  </div>
                  {calculateNights() > 0 && (
                    <div className="text-sm text-gray-600">
                      {calculateNights()} nights × {formatPrice(room.type.pricePerDay)}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Room Total</span>
                    <span>{formatPrice(calculateRoomTotal())}</span>
                  </div>
                  {Object.entries(selectedServices).map(([serviceId, quantity]) => {
                    const service = availableServices.find((s) => s.id === serviceId);
                    if (!service || quantity === 0) return null;
                    return (
                      <div key={serviceId} className="flex justify-between text-sm">
                        <span>
                          {service.name} × {quantity}
                        </span>
                        <span>{formatPrice(service.price * quantity)}</span>
                      </div>
                    );
                  })}
                  {calculateServicesTotal() > 0 && (
                    <div className="flex justify-between">
                      <span>Services Total</span>
                      <span>{formatPrice(calculateServicesTotal())}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(calculateTotal())}</span>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  disabled={!startDate || !endDate || calculateNights() <= 0}
                >
                  <Check className="w-5 h-5 mr-2" />
                  Confirm Booking
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>You will receive a confirmation email within 5 minutes.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
