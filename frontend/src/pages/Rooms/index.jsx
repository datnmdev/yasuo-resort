import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import roomApi from '@apis/room';
import roomTypeApi from '@apis/room-type';
import serviceApi from '@apis/service';
import { Eye, MapPin, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@ui/card';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { useNavigate } from 'react-router';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@ui/pagination';
import { formatCurrencyUSD } from '@libs/utils';
import { useScrollDown } from '@src/hooks/useScrollDown';
import { FilterCard } from './FilterCard';
import { RoomDetailDialog } from './RoomDetailDialog';
import { useDispatch, useSelector } from 'react-redux';
import { roomTypeActions, roomTypeSelector } from '@src/stores/reducers/roomTypeReducer';
import { serviceActions, serviceSelector } from '@src/stores/reducers/serviceReducer';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const RoomPage = () => {
  useScrollDown('#rooms');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filterState, setFilterState] = useState({
    keyword: '',
    maxPeople: '',
    typeId: '',
    priceRange: {
      minPrice: '',
      maxPrice: '',
    },
    dateRange: {
      startDate: '',
      endDate: '',
    },
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltered, setIsFiltered] = useState(false);
  const limit = 4;

  // Get danh sách loại phòng
  const roomTypes = useSelector(roomTypeSelector.selectAll);
  console.log(roomTypes);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await roomTypeApi.getRoomTypes({ page: 1, limit: 1000 });
        const data = res?.data?.data?.[0] ?? [];
        dispatch(roomTypeActions.setRoomTypes(data));
      } catch (err) {
        console.error('Failed to fetch room types:', err);
      }
    };

    if (roomTypes.length === 0) fetchRoomTypes();
  }, [dispatch, roomTypes.length]);

  // Get danh sách dịch vụ
  const services = useSelector(serviceSelector.selectAll);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceApi.getServices({ page: 1, limit: 1000 });
        const data = res?.data?.data?.[0] ?? [];
        dispatch(serviceActions.setServices(data));
      } catch (err) {
        console.error('Failed to fetch room types:', err);
      }
    };

    if (services.length === 0) fetchServices();
  }, [dispatch, services.length]);

  // Lấy danh sách phòng đã lọc
  const { data: roomData } = useQuery({
    queryKey: ['rooms', filterState, currentPage],
    queryFn: () =>
      roomApi.getRooms({
        page: currentPage,
        limit,
        ...(filterState.keyword && { keyword: filterState.keyword }),
        ...(filterState.maxPeople && { maxPeople: Number(filterState.maxPeople) }),
        ...(filterState.typeId && { typeId: Number(filterState.typeId) }),
        ...(filterState.priceRange.minPrice &&
          filterState.priceRange.maxPrice && {
            priceRange: {
              minPrice: Number(filterState.priceRange.minPrice),
              maxPrice: Number(filterState.priceRange.maxPrice),
            },
          }),
        dateRange: {
          startDate: filterState.dateRange.startDate,
          endDate: filterState.dateRange.endDate,
        },
      }),
    enabled: isFiltered,
    keepPreviousData: true,
  });

  const rooms = roomData?.data?.data[0] ?? [];
  const totalPages = Math.ceil((roomData?.data?.data[1] || 1) / limit);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleApplyFilters = () => {
    if (!filterState.dateRange.startDate || !filterState.dateRange.endDate) {
      alert('Please select a date range.');
      return;
    }
    setIsFiltered(true);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterState({
      keyword: '',
      maxPeople: '',
      typeId: '',
      priceRange: {
        minPrice: '',
        maxPrice: '',
      },
      dateRange: {
        startDate: '',
        endDate: '',
      },
    });
    setCurrentPage(1);
  };

  const fadeInUp = {
    initial: { y: 40, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 1 },
  };

  const handleBookRoom = (room) => {
    navigate('/booking-confirmation', {
      state: { room, startDate: filterState.dateRange.startDate, endDate: filterState.dateRange.endDate },
    });
  };

  return (
    <section id="rooms" className="min-h-screen relative py-8">
      {!isFiltered ? (
        // Initial View: Hero Image + Filters
        <>
          <img
            src="/homepage-image-6.jpg"
            alt="Luxurious Resort View"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/30"></div> {/* Darker Overlay */}
          <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
            <motion.div className="text-center text-white mb-6" {...fadeInUp}>
              <h2 className="text-6xl font-extrabold mb-4 drop-shadow-lg">Your Dream Stay Awaits</h2>
              <p className="text-lg md:text-xl text-gray-200 drop-shadow-md">
                Find the perfect room for your next unforgettable vacation.
              </p>
            </motion.div>
            <FilterCard
              filterState={filterState}
              setFilterState={setFilterState}
              handleApplyFilters={handleApplyFilters}
              handleClearFilters={handleClearFilters}
              roomTypes={roomTypes}
              className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-gray-100" // Enhanced styling for initial view
            />
          </div>
        </>
      ) : (
        // Filtered View: Horizontal Layout (Filters on left, Results on right)
        <AnimatePresence mode="wait">
          <div className="container mx-auto px-20 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12">
            {/* Filters Section (Always visible, now in a column) */}
            <aside className="lg:col-span-1">
              <FilterCard
                isFiltered={isFiltered}
                filterState={filterState}
                setFilterState={setFilterState}
                handleApplyFilters={handleApplyFilters}
                handleClearFilters={handleClearFilters}
                roomTypes={roomTypes}
                className="shadow-sm"
              />
            </aside>

            {/* Results Section */}
            <main className="lg:col-span-1">
              {rooms.length === 0 ? (
                <motion.div className="text-center py-16" {...fadeInUp}>
                  <div className="text-gray-400 mb-4">
                    <MapPin className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No rooms found</h3>
                  <p className="text-gray-500">Please try again with different search terms or filters</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rooms.map((room, index) => (
                    <motion.div key={room.id} {...fadeInUp} transition={{ delay: index * 0.2 }}>
                      <Card className="flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 group h-full bg-white">
                        <div className="relative">
                          <img
                            src={`${baseUrl}/${room.media[0]?.path || 'placeholder.svg'}`}
                            alt={`Room ${room.roomNumber}`}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null; // tránh loop vô hạn
                              e.target.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-green-600 hover:bg-green-600 text-white">Room {room.roomNumber}</Badge>
                          </div>
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="bg-white/90 text-gray-700">
                              {room.type.name}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-4 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-gray-800 mb-3">
                            {room.type.name} - Room {room.roomNumber}
                          </h3>
                          <div
                            className="text-sm text-gray-600 line-clamp-2 flex-1"
                            dangerouslySetInnerHTML={{ __html: room.description }}
                          ></div>

                          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-green-600" />
                              <span>{room.maxPeople} Guests</span>
                            </div>
                          </div>

                          <div className="mb-4 text-sm text-gray-700">
                            <h4 className="font-semibold mb-2">Included Services:</h4>
                            <div className="flex flex-wrap gap-2">
                              {roomTypes
                                ?.find((type) => type.id === room.typeId)
                                ?.roomTypeAddons?.map((addon, index) => {
                                  const service = services.find((s) => s.id === addon.serviceId);
                                  return (
                                    <div key={index} className="flex items-center gap-1 text-sm text-gray-600">
                                      <Badge variant="outlined">{service?.name || 'Không rõ'}</Badge>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                          <div className="text-2xl font-bold text-teal-600 mb-4">
                            {formatCurrencyUSD(room.price)}/night
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                              onClick={() => setSelectedRoom(room)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleBookRoom(room)}
                            >
                              Book Room
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </main>
          </div>
        </AnimatePresence>
      )}

      {/* Room Detail Modal */}
      {!!selectedRoom && (
        <RoomDetailDialog
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          handleBookRoom={handleBookRoom}
          roomTypes={roomTypes}
          services={services}
        />
      )}
    </section>
  );
};

export default RoomPage;
