import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Cart from './Cart';
import ServiceCard from './ServiceCard';
import BookedServices from './BookedServices';
import { CalendarDays, Check, ChevronLeft, ChevronRight, ChevronsUpDown, Loader2, Search, Star } from 'lucide-react';
import { Input } from '@ui/input';
import { Card, CardContent } from '@ui/card';
import serviceApi from '@apis/service';
import { Button } from '@ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import bookingApi from '@apis/booking';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@ui/command';
import { cn, formatDateVN } from '@libs/utils';
import { useCart } from '@src/hooks/useCart';

export default function ServicePage() {
  // States for Combobox
  const { booking, setBooking } = useCart();
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [comboboxSearchQuery, setComboboxSearchQuery] = useState('');
  const [comboboxPage, setComboboxPage] = useState(1);
  const comboboxPageSize = 4;

  const { data: bookingData, isPending: isFetchingComboboxBookings } = useQuery({
    queryKey: ['bookings', comboboxPage, comboboxSearchQuery],
    queryFn: () =>
      bookingApi.getBookings({
        page: comboboxPage,
        limit: comboboxPageSize,
        keyword: searchQuery,
      }),
    keepPreviousData: true,
  });
  const bookings = bookingData?.data?.data[0] || [];
  const comboboxTotalPages = Math.ceil((bookingData?.data?.data[1] || 1) / comboboxPageSize);

  const handleComboboxSelect = (id) => {
    setBooking(bookings.find((b) => `${b.id} - ${b.room.roomNumber}` === id));
    setComboboxOpen(false);
  };

  // States for Services
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 4;
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

  const services = data?.data?.data[0] || [];
  const totalPages = Math.ceil((data?.data?.data[1] || 1) / limit);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-8">
      {/* Display current booking ID and dates with Combobox */}
      <Card className="mb-6 border-teal-300 bg-teal-50">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-teal-800 font-semibold">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            <span>Đặt dịch vụ cho đơn phòng:</span>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild className="hover:bg-gray-100/50">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-[240px] justify-between bg-white"
                >
                  {booking.id ? `${booking.id} - ${booking.room.roomNumber}` : 'Chọn mã đơn phòng...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Tìm kiếm mã đơn phòng..."
                    value={comboboxSearchQuery}
                    onValueChange={setComboboxSearchQuery}
                  />
                  <CommandList>
                    {isFetchingComboboxBookings ? (
                      <CommandEmpty>
                        <Loader2 className="mr-2 h-4 w-4 center-both animate-spin" /> Đang tải...
                      </CommandEmpty>
                    ) : bookings.length === 0 ? (
                      <CommandEmpty>Không tìm thấy phòng.</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {bookings.map((b) => (
                          <CommandItem key={b.id} value={b.id} onSelect={handleComboboxSelect}>
                            <Check className={cn('mr-2 h-4 w-4', booking.id === b.id ? 'opacity-100' : 'opacity-0')} />
                            {b.id} - {b.room.roomNumber}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                  {comboboxTotalPages > 1 && (
                    <div className="flex items-center justify-between p-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setComboboxPage((prev) => Math.max(1, prev - 1))}
                        disabled={comboboxPage === 1 || isFetchingComboboxBookings}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-gray-600">
                        Trang {comboboxPage} / {comboboxTotalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setComboboxPage((prev) => Math.min(comboboxTotalPages, prev + 1))}
                        disabled={comboboxPage === comboboxTotalPages || isFetchingComboboxBookings}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              <span>Nhận phòng: {formatDateVN(booking.startDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              <span>Trả phòng: {formatDateVN(booking.endDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-200" />
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 h-12 bg-white rounded-lg outline-none border border-gray-300 focus:border-teal-500 focus:ring-teal-500 transition-colors duration-200"
              />
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-gray-300 bg-white">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {services.map((service, idx) => (
                  <ServiceCard key={idx} service={service} />
                ))}
              </div>

              {services.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy dịch vụ</h3>
                  <p className="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
                </div>
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
            </>
          )}
        </div>
        <div className="space-y-6">
          <Cart />
          <BookedServices />
        </div>
      </div>
    </div>
  );
}
