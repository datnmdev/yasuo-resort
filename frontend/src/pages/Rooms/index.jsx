import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import roomApi from '@apis/room';
import { Input } from '@ui/input';
import { Calendar, ChevronLeft, ChevronRight, Eye, House, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@ui/card';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { useNavigate } from 'react-router';
import { formatCurrencyUSD } from '@src/libs/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const RoomPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const limit = 4;
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['rooms', currentPage, searchQuery],
    queryFn: () =>
      roomApi.getRooms({
        page: currentPage,
        limit,
        keyword: searchQuery,
      }),
    keepPreviousData: true,
  });

  const rooms = data?.data?.data[0] || [];
  const totalPages = Math.ceil((data?.data?.data[1] || 1) / limit);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const fadeInUp = {
    initial: { y: 60 },
    animate: { y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: { opacity: 1 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const nextImage = () => {
    if (selectedRoom) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedRoom.media.length);
    }
  };

  const prevImage = () => {
    if (selectedRoom) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedRoom.media.length) % selectedRoom.media.length);
    }
  };

  const handleBookRoom = (room) => {
    navigate('/booking-confirmation', { state: { room } });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-12">
      {/* Filters */}
      <section>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by room number..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-8 px-4">
        {rooms.length === 0 ? (
          <motion.div className="text-center py-16" {...fadeInUp}>
            <div className="text-gray-400 mb-4">
              <House className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No rooms found</h3>
            <p className="text-gray-500">Please try again with different search terms or filters</p>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={staggerContainer}>
            {rooms.map((room) => (
              <motion.div key={room.id} variants={fadeInUp}>
                <Card className="flex flex-col overflow-hidden hover:shadow-md transition-all duration-300 group bg-white h-full">
                  <div className="relative">
                    <img
                      src={`${baseUrl}/${room.media[0]?.path || 'placeholder.svg'}`}
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-teal-600 hover:bg-teal-600 text-white">Room {room.roomNumber}</Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700">
                        {room.type.name}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="mb-3 flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {room.type.name} - Room {room.roomNumber}
                      </h3>
                      <div
                        className="text-sm text-gray-600 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: room.description }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-teal-600">
                          {formatCurrencyUSD(room.type.pricePerDay)}/night
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent"
                        onClick={() => {
                          setSelectedRoom(room);
                          setCurrentImageIndex(0);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-teal-600 hover:bg-teal-700"
                        onClick={() => handleBookRoom(room)}
                      >
                        Book Room
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="transition-colors duration-200 hover:bg-teal-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                onClick={() => setCurrentPage(page)}
                className={`transition-colors duration-200 hover:bg-teal-700 ${
                  currentPage === page ? 'bg-teal-600 ' : ''
                }`}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="transition-colors duration-200 hover:bg-teal-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </section>

      {/* Room Detail Modal */}
      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          {selectedRoom && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-teal-600">
                  {selectedRoom.type.name} - Room {selectedRoom.roomNumber}
                </DialogTitle>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Image Carousel */}
                <div className="relative">
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                    <img
                      src={`${baseUrl}/${selectedRoom.media[currentImageIndex]?.path || 'placeholder.svg'}`}
                      alt={`Room ${selectedRoom.roomNumber}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedRoom.media.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  {selectedRoom.media.length > 1 && (
                    <div className="flex justify-center mt-3 gap-2">
                      {selectedRoom.media.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-teal-600' : 'bg-gray-300'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Room Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Room Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Room Number:</span>
                        <span className="font-semibold ml-2">{selectedRoom.roomNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Room Type:</span>
                        <span className="font-semibold ml-2">{selectedRoom.type.name}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Room Rate</h3>
                    <div className="text-2xl font-bold text-teal-600">
                      {formatCurrencyUSD(selectedRoom.type.pricePerDay)}
                    </div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <div
                      className="text-sm text-gray-600 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: selectedRoom.description }}
                    ></div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Room Created</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(selectedRoom.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      size="lg"
                      onClick={() => {
                        setSelectedRoom(null);
                        handleBookRoom(selectedRoom.id);
                      }}
                    >
                      Book This Room
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomPage;
