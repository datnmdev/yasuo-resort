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
import { AnimatePresence, motion } from 'framer-motion';
import { useScrollDown } from '@src/hooks/useScrollDown';
import Cookies from 'js-cookie';

const FavoriteRoom = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    // show ~2-3 favorite rooms per page
    const limit = 2;
    useScrollDown('#favorite-rooms');

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['favoriteRooms', page, limit],
        queryFn: () => userApi.getFavoriteRooms({ page, limit }).then((res) => res.data.data),
        keepPreviousData: true,
    });

    const favorites = data?.[0] || [];
    const total = data?.[1] || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const handleRemove = async (fav) => {
        try {
            await userApi.deleteFavoriteRoom(fav.id || fav.favoriteId || fav.favorite_room_id);
            toast.success('Removed from favorites');
            // refetch and if the current page becomes empty, go back one page
            const result = await refetch();
            const items = result.data?.[0] || [];
            if (items.length === 0 && page > 1) {
                setPage((p) => p - 1);
            }
        } catch (err) {
            console.error(err);
            toast.error('Remove failed');
        }
    };

    const handleView = (room) => {
        navigate(`/booking-confirmation/${room.id}`, { state: { room } });
    };

    if (isLoading) return <div className="p-8 text-center">Loading favorite rooms...</div>;
    if (isError) return <div className="p-8 text-center text-red-600">Failed to load favorites</div>;

    const fadeInUp = {
        initial: { y: 40, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.5 },
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <section id="favorite-rooms" className=" relative py-8">
                <div className="max-w-7xl mx-auto px-6 pb-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">Your favorite rooms</h1>
                        <p className="text-gray-600">List of rooms you saved for later.</p>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">You don't have any favorite rooms yet</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {favorites.map((fav, index) => {
                                const room = fav.room || fav;
                                return (
                                    <motion.div key={room.id} {...fadeInUp} transition={{ delay: index * 0.05 }}>
                                        <Card className="flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 group h-full bg-white">
                                            <div className="relative">
                                                <img
                                                    src={`${import.meta.env.VITE_API_BASE_URL}/${room.media?.[0]?.path || 'placeholder.svg'}`}
                                                    alt={`Room ${room.roomNumber}`}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg'; }}
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <div className="bg-teal-600 text-white px-2 py-1 rounded">Room {room.roomNumber}</div>
                                                </div>
                                                <div className="absolute top-3 right-3">
                                                    <div className="bg-white/90 text-gray-700 px-2 py-1 rounded">{room.type?.name}</div>
                                                </div>
                                            </div>

                                            <CardContent className="p-4 flex-1 flex flex-col">
                                                <h3 className="text-xl font-bold text-gray-800 mb-3">
                                                    {room.type?.name} - Room {room.roomNumber}
                                                </h3>
                                                <div className="text-sm text-gray-600 line-clamp-2 flex-1" dangerouslySetInnerHTML={{ __html: room.description }}></div>

                                                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-4 h-4 text-teal-600" />
                                                        <span>{room.maxPeople} Guests</span>
                                                    </div>
                                                </div>

                                                <div className="text-2xl font-bold text-teal-600 mb-4 flex justify-between items-center">
                                                    <span>{formatCurrencyUSD(room.price)}/day</span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => {
                                                        const accessToken = Cookies.get('accessToken');
                                                        if (!accessToken) { toast.warning('Please log in before booking a room!'); setTimeout(() => navigate('/login'), 3000); return; }
                                                        navigate(`/booking-confirmation/${room.id}`, { state: { room } });
                                                    }}>
                                                        Book Room
                                                    </Button>
                                                    <Button className="border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent" size="sm" variant="outline" onClick={() => handleRemove(fav)}>Remove from favorite list</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            className={page <= 1 ? 'opacity-50 pointer-events-none' : ''}
                                            onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <PaginationItem key={p}>
                                            <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p); }}>
                                                {p}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            className={page >= totalPages ? 'opacity-50 pointer-events-none' : ''}
                                            onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </section>
        </motion.div>
    );
};

export default FavoriteRoom;
