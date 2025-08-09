// hooks/useBookings.js
import { useQuery } from '@tanstack/react-query';
import bookingApi from '@apis/booking';

export const useBookings = ({
    page = 1,
    limit = 10,
    keyword = '',
    userId,
    status = ['confirmed', 'pending'],
} = {}) => {
    return useQuery({
        queryKey: ['bookings', page, keyword, userId, status],
        queryFn: () =>
            bookingApi.getBookings({
                page,
                limit,
                keyword,
                userId,
                status,
            }),
        keepPreviousData: true,
        enabled: !!userId,
    });
};
