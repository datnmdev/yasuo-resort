import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import userApi from '@apis/user';
import { Card, CardContent } from '@ui/card';
import { Button } from '@ui/button';
import { formatCurrencyUSD } from '@libs/utils';
import { toast } from 'react-toastify';
import { Eye, Package } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@ui/pagination';
import { motion } from 'framer-motion';
import { useScrollDown } from '@src/hooks/useScrollDown';
import Cookies from 'js-cookie';

const FavoriteService = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    // show ~2 favorite services per page (small page)
    const limit = 2;
    useScrollDown('#favorite-services');

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['favoriteServices', page, limit],
        queryFn: () => userApi.getFavoriteServices({ page, limit }).then((res) => res.data.data),
        keepPreviousData: true,
    });

    const favorites = data?.[0] || [];
    const total = data?.[1] || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const handleRemove = async (fav) => {
        try {
            await userApi.deleteFavoriteService(fav.id || fav.favoriteId || fav.favorite_service_id);
            toast.success('Removed from favorites');
            const result = await refetch();
            const items = result.data?.[0] || [];
            if (items.length === 0 && page > 1) setPage((p) => p - 1);
        } catch (err) {
            console.error(err);
            toast.error('Remove failed');
        }
    };

    const handleView = (service) => {
        navigate(`/services/${service.id}`, { state: { service } });
    };

    if (isLoading) return <div className="p-8 text-center">Loading favorite services...</div>;
    if (isError) return <div className="p-8 text-center text-red-600">Failed to load favorites</div>;

    const fadeInUp = {
        initial: { y: 40, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.5 },
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <section id="favorite-services" className=" relative py-8">
                <div className="max-w-7xl mx-auto px-6 pb-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">Your favorite services</h1>
                        <p className="text-gray-600">List of services you saved for later.</p>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">You don't have any favorite services yet</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {favorites.map((fav, index) => {
                                const service = fav.service || fav;
                                return (
                                    <motion.div key={service.id} {...fadeInUp} transition={{ delay: index * 0.05 }}>
                                        <Card className="flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 group h-full bg-white">

                                            <CardContent className="p-4 flex-1 flex flex-col">
                                                <h3 className="text-xl font-bold text-gray-800 mb-3">{service.name}</h3>
                                                <div className="text-sm text-gray-600 line-clamp-2 flex-1" dangerouslySetInnerHTML={{ __html: service.description }}></div>

                                                <div className="text-2xl font-bold text-teal-600 mb-4 flex justify-between items-center">
                                                    <span>{formatCurrencyUSD(service.price)}</span>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleRemove(fav)}>Remove</Button>
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

export default FavoriteService;