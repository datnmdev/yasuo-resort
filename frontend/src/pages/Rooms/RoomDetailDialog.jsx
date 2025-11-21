import { Calendar, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '@ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';
import { formatCurrencyUSD } from '@libs/utils';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import Cookies from 'js-cookie';
import useFetch from '@src/hooks/fetch.hook';
import apis from '@apis/index';
import { Rate } from 'antd';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function RoomDetailDialog({ selectedRoom, setSelectedRoom, handleBookRoom }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

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

  const [specificRoomFeedback, setSpecificRoomFeedback] = useState([])
  const { data: feedbacksData, loading: isLoadingFeedbacks } = useFetch(
    selectedRoom
      ? () => apis.user.getFeedbacks({
        page: 1,
        limit: 10,
        targetType: 'room',
        targetId: selectedRoom.id
      })
      : null
  );

  useEffect(() => {
    if (feedbacksData?.data?.[0] && selectedRoom) {
      const temp = feedbacksData.data[0].filter(item =>
        item?.targetId === selectedRoom.id
      );
      setSpecificRoomFeedback(temp);
    } else {
      setSpecificRoomFeedback([]);
    }
  }, [feedbacksData, selectedRoom?.id]);

  return (
    <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    onError={(e) => {
                      e.target.onerror = null; // tránh loop vô hạn
                      e.target.src = '/placeholder.svg';
                    }}
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
                        className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-teal-600' : 'bg-gray-300'
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
                  <div className="text-2xl font-bold text-teal-600">{formatCurrencyUSD(selectedRoom.price)}/day</div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-teal-600" />
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
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    size="lg"
                    onClick={() => {
                      const accessToken = Cookies.get('accessToken');
                      if (!accessToken) {
                        toast.warning('Please log in before booking a room!');
                        setTimeout(() => navigate('/login'), 3000);
                        return;
                      }

                      setSelectedRoom(null);
                      handleBookRoom(selectedRoom);
                    }}
                  >
                    Book This Room
                  </Button>
                </div>
              </div>
              <div className="md:col-span-2 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Guest Reviews</h3>
                    {specificRoomFeedback.length > 0 && (
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-gray-900 mr-2">
                          {(
                            specificRoomFeedback.reduce((sum, item) => sum + item.rating, 0) /
                            specificRoomFeedback.length
                          ).toFixed(1)}
                        </span>
                        <Rate
                          disabled
                          allowHalf
                          value={
                            specificRoomFeedback.reduce((sum, item) => sum + item.rating, 0) /
                            specificRoomFeedback.length
                          }
                          className="text-yellow-400"
                        />
                        <span className="ml-2 text-gray-500 text-sm">
                          ({specificRoomFeedback.length} {specificRoomFeedback.length === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>

                  {isLoadingFeedbacks ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
                    </div>
                  ) : specificRoomFeedback.length > 0 ? (
                    <div className="space-y-6">
                      {specificRoomFeedback.map((feedback) => (
                        <div key={feedback.id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex items-start gap-4">
                            <img
                              src={`${baseUrl}/${feedback.user?.avatar || 'default-avatar.png'}`}
                              alt={feedback.user?.name || 'User'}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <p className="font-medium text-gray-900">{feedback.user?.name || 'Anonymous'}</p>
                                  <Rate
                                    disabled
                                    value={feedback.rating}
                                    className="text-yellow-400 text-sm"
                                    style={{ fontSize: 16 }}
                                  />
                                </div>
                                <span className="text-sm text-gray-400">
                                  {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              {feedback.comment && (
                                <p className="mt-3 text-gray-700">{feedback.comment}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg
                          className="w-12 h-12 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500">No reviews yet. Be the first to review this room!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
