import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import userApi from '@apis/user';
import { Card, CardContent } from '@ui/card';
import { Button } from '@ui/button';
import { formatCurrencyUSD } from '@libs/utils';
import { toast } from 'react-toastify';
import { Eye, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@ui/pagination';
import { motion } from 'framer-motion';
import { useScrollDown } from '@src/hooks/useScrollDown';
import Cookies from 'js-cookie';

const Favorites = () => {
    const navigate = useNavigate();
    // Rooms state
    const [roomPage, setRoomPage] = useState(1);
    const roomLimit = 2;
    // Services state
    const [servicePage, setServicePage] = useState(1);
    const serviceLimit = 2;

    useScrollDown('#favorites');

    const { data: roomData, isLoading: roomsLoading, isError: roomsError, refetch: refetchRooms } = useQuery({
        queryKey: ['favoriteRooms', roomPage, roomLimit],
        queryFn: () => userApi.getFavoriteRooms({ page: roomPage, limit: roomLimit }).then((res) => res.data.data),
        keepPreviousData: true,
    });

    const { data: serviceData, isLoading: servicesLoading, isError: servicesError, refetch: refetchServices } = useQuery({
        queryKey: ['favoriteServices', servicePage, serviceLimit],
        queryFn: () => userApi.getFavoriteServices({ page: servicePage, limit: serviceLimit }).then((res) => res.data.data),
        keepPreviousData: true,
    });

    const rooms = roomData?.[0] || [];
    const roomsTotal = roomData?.[1] || 0;
    const roomsTotalPages = Math.max(1, Math.ceil(roomsTotal / roomLimit));

    const services = serviceData?.[0] || [];
    const servicesTotal = serviceData?.[1] || 0;
    const servicesTotalPages = Math.max(1, Math.ceil(servicesTotal / serviceLimit));

    const handleRemoveRoom = async (fav) => {
        try {
            await userApi.deleteFavoriteRoom(fav.id || fav.favoriteId || fav.favorite_room_id);
            toast.success('Removed from favorites');
            const result = await refetchRooms();
            const items = result.data?.[0] || [];
            if (items.length === 0 && roomPage > 1) setRoomPage((p) => p - 1);
        } catch (err) {
            console.error(err);
            toast.error('Remove failed');
        }
    };

    const handleRemoveService = async (fav) => {
        try {
            await userApi.deleteFavoriteService(fav.id || fav.favoriteId || fav.favorite_service_id);
            toast.success('Removed from favorites');
            const result = await refetchServices();
            const items = result.data?.[0] || [];
            if (items.length === 0 && servicePage > 1) setServicePage((p) => p - 1);
        } catch (err) {
            console.error(err);
            toast.error('Remove failed');
        }
    };

    const fadeInUp = {
        initial: { y: 40, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.5 },
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <section id="favorites" className="min-h-screen relative py-8">
                <div className="max-w-7xl mx-auto px-6 pb-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">Your favorites</h1>
                        <p className="text-gray-600">Rooms (left) and Services (right)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Favorite Rooms */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Favorite Rooms</h2>
                            {roomsLoading ? (
                                <div className="p-8 text-center">Loading favorite rooms...</div>
                            ) : roomsError ? (
                                <div className="p-8 text-center text-red-600">Failed to load favorites</div>
                            ) : rooms.length === 0 ? (
                                <div className="text-center text-gray-400 py-12">You don't have any favorite rooms yet</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {rooms.map((fav, idx) => {
                                        const room = fav.room || fav;
                                        return (
                                            <motion.div key={`room-${room.id}`} {...fadeInUp} transition={{ delay: idx * 0.04 }}>
                                                <Card className="flex gap-4 items-center p-0">
                                                    <img src={`${import.meta.env.VITE_API_BASE_URL}/${room.media?.[0]?.path || 'placeholder.svg'}`} alt={`Room ${room.roomNumber}`} className="w-28 h-20 object-cover rounded-l" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }} />
                                                    <CardContent className="flex-1">
                                                        <div className="font-semibold">{room.type?.name} - Room {room.roomNumber}</div>
                                                        <div className="text-sm text-gray-500">{formatCurrencyUSD(room.price)}/day</div>
                                                        <div className="mt-2 flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => navigate(`/rooms/${room.id}`)}><Eye className="w-4 h-4 mr-2" />View</Button>
                                                            <Button size="sm" onClick={() => navigate(`/booking-confirmation/${room.id}`, { state: { room } })}>Book</Button>
                                                            <Button size="sm" variant="outline" onClick={() => handleRemoveRoom(fav)}>Remove</Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {roomsTotalPages > 1 && (
                                <div className="mt-4">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious href="#" className={roomPage <= 1 ? 'opacity-50 pointer-events-none' : ''} onClick={(e) => { e.preventDefault(); if (roomPage > 1) setRoomPage(roomPage - 1); }} />
                                            </PaginationItem>
                                            {Array.from({ length: roomsTotalPages }, (_, i) => i + 1).map((p) => (
                                                <PaginationItem key={p}>
                                                    <PaginationLink href="#" isActive={p === roomPage} onClick={(e) => { e.preventDefault(); setRoomPage(p); }}>{p}</PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext href="#" className={roomPage >= roomsTotalPages ? 'opacity-50 pointer-events-none' : ''} onClick={(e) => { e.preventDefault(); if (roomPage < roomsTotalPages) setRoomPage(roomPage + 1); }} />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </div>

                        {/* Right: Favorite Services */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Favorite Services</h2>
                            {servicesLoading ? (
                                <div className="p-8 text-center">Loading favorite services...</div>
                            ) : servicesError ? (
                                <div className="p-8 text-center text-red-600">Failed to load favorites</div>
                            ) : services.length === 0 ? (
                                <div className="text-center text-gray-400 py-12">You don't have any favorite services yet</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {services.map((fav, idx) => {
                                        const service = fav.service || fav;
                                        return (
                                            <motion.div key={`service-${service.id}`} {...fadeInUp} transition={{ delay: idx * 0.04 }}>
                                                <Card className="flex gap-4 items-center p-0">
                                                    <img src={`${import.meta.env.VITE_API_BASE_URL}/${service.media?.[0]?.path || 'placeholder.svg'}`} alt={`${service.name}`} className="w-28 h-20 object-cover rounded-l" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }} />
                                                    <CardContent className="flex-1">
                                                        <div className="font-semibold">{service.name}</div>
                                                        <div className="text-sm text-gray-500">{formatCurrencyUSD(service.price)}</div>
                                                        <div className="mt-2 flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => navigate(`/services/${service.id}`)}><Eye className="w-4 h-4 mr-2" />View</Button>
                                                            <Button size="sm" onClick={() => navigate(`/services/${service.id}`, { state: { service } })}>Order</Button>
                                                            <Button size="sm" variant="outline" onClick={() => handleRemoveService(fav)}>Remove</Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {servicesTotalPages > 1 && (
                                <div className="mt-4">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious href="#" className={servicePage <= 1 ? 'opacity-50 pointer-events-none' : ''} onClick={(e) => { e.preventDefault(); if (servicePage > 1) setServicePage(servicePage - 1); }} />
                                            </PaginationItem>
                                            {Array.from({ length: servicesTotalPages }, (_, i) => i + 1).map((p) => (
                                                <PaginationItem key={p}>
                                                    <PaginationLink href="#" isActive={p === servicePage} onClick={(e) => { e.preventDefault(); setServicePage(p); }}>{p}</PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext href="#" className={servicePage >= servicesTotalPages ? 'opacity-50 pointer-events-none' : ''} onClick={(e) => { e.preventDefault(); if (servicePage < servicesTotalPages) setServicePage(servicePage + 1); }} />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

export default Favorites;
