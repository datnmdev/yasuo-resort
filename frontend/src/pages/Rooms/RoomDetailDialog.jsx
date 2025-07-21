import { Calendar, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '@ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';
import { formatCurrencyVND } from '@libs/utils';
import { useState } from 'react';
import { Badge } from '@ui/badge';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function RoomDetailDialog({ selectedRoom, setSelectedRoom, handleBookRoom, roomTypes, services }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  return (
    <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {selectedRoom && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-green-600">
                {selectedRoom.type.name} - Room {selectedRoom.roomNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Image Carousel */}
              <div className="relative">
                <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                  <img
                    src={`${baseUrl}/${selectedRoom.media[0]?.path || 'placeholder.svg'}`}
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
                          index === currentImageIndex ? 'bg-green-600' : 'bg-gray-300'
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
                  <div className="text-2xl font-bold text-green-600">{formatCurrencyVND(selectedRoom.price)}/night</div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-green-600" />
                      <span>Capacity: {selectedRoom.maxPeople} Guests</span>
                    </div>
                    {/* {selectedRoom.type.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <span>{amenity}</span>
                        </div>
                      ))} */}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Included Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {roomTypes
                      ?.find((type) => type.id === selectedRoom.typeId)
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

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                  <div
                    className="text-gray-600 text-sm leading-relaxed"
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
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={() => {
                      setSelectedRoom(null);
                      handleBookRoom(selectedRoom);
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
  );
}
