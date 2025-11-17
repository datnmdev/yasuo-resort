import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { userSelector } from '@src/stores/reducers/userReducer';
import bookingApi from '@apis/booking';
import userApi from '@apis/user';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { useQuery } from '@tanstack/react-query';
import { Eye, MapPin, Users, Heart, Star } from 'lucide-react';
import roomApi from '@apis/room';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrencyUSD } from '@libs/utils';
import 'react-toastify/dist/ReactToastify.css';
import FeedbackModal from '@components/FeedbackModal/FeedbackModal';

export default function BookingHistory() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };

    // chọn loại feedback
    const [typeFeedback, setTypeFeedback] = useState('room');
    const [contracts, setContracts] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isOpenModalFeedback, setIsOpenModalFeedback] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    console.log("check contracts", contracts);
    console.log("check rooms", rooms);

    //lấy lịch sử phòng đã đặt của user, những phòng ở trang thái completed, có endDate < hiện tại
    const user = useSelector(userSelector.selectUser);
    const getBookingByUserId = async () => {
        try {
            const res = await bookingApi.getBookings({ page: 1, limit: Number.MAX_SAFE_INTEGER });
            const bookings = res.data.data[0] || [];
            // Lọc chỉ lấy booking của user hiện tại
            const userBookings = bookings.filter((booking) => booking.userId === user?.id
                && booking.status === 'confirmed' && booking.endDate < new Date().toISOString());
            setContracts(userBookings);
        } catch (err) {
            toast.error('Cannot get booking history');
        }
    };

    const getRoomsByContract = async () => {
        try {
            const res = await roomApi.getRooms({ page: 1, limit: Number.MAX_SAFE_INTEGER });
            console.log(res.data); // xem data thực tế
            const rooms = res.data.data || [];
            setRooms(rooms);
        } catch (err) {
            toast.error('Cannot get room');
        }
    };

    const mapImageRoomFromContract = (id) => {
        const room = rooms[0].find((room) => room.id === id);
        return room?.media[0]?.path || 'placeholder.svg';
    };

    const handleFeedbackOpen = (booking) => {
        setSelectedBooking(booking);
        setIsOpenModalFeedback(true);
    };

    const handleFeedbackSubmit = async (feedback) => {
        if (!selectedBooking) return;
        setFeedbackLoading(true);
        try {
            // Create feedback for room
            const feedbackPromises = [
                userApi.createFeedback({
                    rating: feedback.roomRating,
                    comment: feedback.roomComment,
                    bookingId: selectedBooking.id,
                    targetType: 'room',
                    targetId: selectedBooking.roomId,
                }),
            ];

            // Create feedback for each confirmed service with its own comment
            if (feedback.serviceRatings && Object.keys(feedback.serviceRatings).length > 0) {
                selectedBooking.bookingServices?.forEach((bookingService) => {
                    // Use bookingService.id as key (from FeedbackModal state)
                    const rating = feedback.serviceRatings[bookingService.id];
                    const comment = feedback.serviceComments?.[bookingService.id];
                    if (rating && comment) {
                        feedbackPromises.push(
                            userApi.createFeedback({
                                rating,
                                comment,
                                bookingId: selectedBooking.id,
                                targetType: 'service',
                                targetId: bookingService.serviceId, // Send actual serviceId to API
                            })
                        );
                    }
                });
            }

            await Promise.all(feedbackPromises);
            toast.success('Thank you for your feedback!');
        } catch (err) {
            console.error('Feedback submission error:', err);
            toast.warning(err?.error?.message || "This room/service has already been reviewed.");
        } finally {
            setFeedbackLoading(false);
        }
    };

    useEffect(() => {
        getBookingByUserId();
    }, [user]);

    useEffect(() => {
        getRoomsByContract();
    }, []);


    return (
        <>
            <div className="container mx-auto px-20">
                {/* chọn loại feedback */}
                <Card className="shadow-sm border-none">
                    <CardContent className="flex items-center py-4">
                        <CardTitle className="text-base mr-4">Type of Feedback</CardTitle>

                        <Select value={typeFeedback} onValueChange={setTypeFeedback}>
                            <SelectTrigger className="w-100">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="room">Room</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                                <SelectItem value="combo">Combo</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>

                    <div className="grid grid-cols-1 gap-6">
                        {contracts.map((contract, index) => (
                            <motion.div
                                key={contract.id}
                                {...fadeInUp}
                                transition={{ delay: index * 0.2 }}
                                className="border rounded-lg shadow p-4 flex items-center"
                            >
                                {/* Cột 1: Ảnh */}
                                <div className="w-1/4">
                                    <img
                                        src={`${baseUrl}/${mapImageRoomFromContract(contract.roomId) || 'placeholder.svg'}`}
                                        alt={`Room ${rooms.roomNumber}`}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.onerror = null; // tránh loop vô hạn
                                            e.target.src = '/placeholder.svg';
                                        }}
                                    />
                                </div>

                                {/* Cột 2: Thông tin */}
                                <div className="w-2/4 px-4 flex justify-between">
                                    <div>
                                        <div className="font-medium mb-1">Customer</div>
                                        <div className="text-gray-700">{contract.user?.name}</div>
                                        <div className="text-gray-500">Email: {contract.user?.email}</div>
                                        <div className="text-gray-500">Phone: {contract.user?.phone}</div>
                                        <div className="text-gray-500 ">Citizen identification: {contract.user?.cccd}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium mb-1">Room</div>
                                        <div className="text-gray-700">
                                            {contract.room?.roomNumber} ({contract.room?.type?.name})
                                        </div>
                                        <div className="text-gray-500 ">Number of people staying: {contract?.capacity} people</div>
                                        <div className="text-gray-500 ">Date in: {contract.startDate}</div>
                                        <div className="text-gray-500 ">Date out: {contract.endDate}</div>
                                        <div className="text-gray-500 ">Room's price: {formatCurrencyUSD(contract.roomPrice)}</div>
                                        <div className="text-gray-500 ">Total: {formatCurrencyUSD(contract.totalPrice)}</div>
                                    </div>
                                </div>

                                {/* Cột 3: Button */}
                                <div className="w-1/4 flex flex-col items-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border-teal-600 text-teal-600 hover:bg-blue-200 bg-transparent px-4 py-2  mb-2"
                                        onClick={() => console.log(contract.id)}
                                    >
                                        <Heart className="w-4 h-4 mr-2" />
                                        Detail
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2"
                                        onClick={() => handleFeedbackOpen(contract)}
                                    >
                                        <Heart className="w-4 h-4 mr-2" />
                                        Feedback
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </div>
            <FeedbackModal
                isOpen={isOpenModalFeedback}
                onClose={() => {
                    setIsOpenModalFeedback(false);
                    setSelectedBooking(null);
                }}
                title="Share Your Experience"
                onSubmit={handleFeedbackSubmit}
                loading={feedbackLoading}
                bookingServices={selectedBooking?.bookingServices || []}
            />
        </>
    );
}
