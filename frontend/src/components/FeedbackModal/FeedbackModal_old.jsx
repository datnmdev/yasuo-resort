import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';
import { Button } from '@ui/button';
import { Textarea } from '@ui/textarea';
import { Star, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const FeedbackModal = ({ isOpen, onClose, title = 'Share Your Feedback', onSubmit, loading = false, bookingServices = [] }) => {
    const [roomRating, setRoomRating] = useState(0);
    const [roomComment, setRoomComment] = useState('');
    const [hoveredRoomRating, setHoveredRoomRating] = useState(0);

    const [serviceComments, setServiceComments] = useState({});
    const [serviceRatings, setServiceRatings] = useState({});
    const [hoveredServiceRatings, setHoveredServiceRatings] = useState({});

    // Filter only confirmed services
    const confirmedServices = bookingServices.filter(bs => bs.status === 'confirmed');

    // Debug: log structure
    React.useEffect(() => {
        if (confirmedServices.length > 0) {
            console.log('Confirmed Services:', confirmedServices);
            console.log('First service structure:', confirmedServices[0]);
        }
    }, [confirmedServices]);

    const handleRoomCommentChange = (text) => setRoomComment(text);

    const handleServiceRatingChange = (bookingServiceId, rating) => {
        setServiceRatings(prev => ({ ...prev, [bookingServiceId]: rating }));
    };

    const handleServiceCommentChange = (bookingServiceId, text) => {
        setServiceComments(prev => ({ ...prev, [bookingServiceId]: text }));
    };

    const handleServiceHover = (bookingServiceId, rating) => {
        setHoveredServiceRatings(prev => ({ ...prev, [bookingServiceId]: rating }));
    };

    const allServicesRated = confirmedServices.length === 0 || confirmedServices.every(s => serviceRatings[s.id]);
    const allCommentsValid = roomComment.trim().length >= 10 &&
        (confirmedServices.length === 0 || confirmedServices.every(s => (serviceComments[s.id] || '').trim().length >= 10));

    // Debug logging
    React.useEffect(() => {
        console.log('FeedbackModal Debug:', {
            roomRating,
            roomCommentLength: roomComment.trim().length,
            confirmedServicesCount: confirmedServices.length,
            serviceRatings,
            serviceComments,
            allServicesRated,
            allCommentsValid,
            buttonDisabled: roomRating === 0 || roomComment.trim().length < 10 || (confirmedServices.length > 0 && (!allServicesRated || !confirmedServices.every(s => (serviceComments[s.id] || '').trim().length >= 10)))
        });
    }, [roomRating, roomComment, serviceRatings, serviceComments, confirmedServices, allServicesRated, allCommentsValid]);

    const handleSubmit = async () => {
        if (roomRating === 0) {
            toast.warning('Please rate the room');
            return;
        }
        if (roomComment.trim().length < 10) {
            toast.warning('Room comment must be at least 10 characters');
            return;
        }
        // Only validate services if there are confirmed services
        if (confirmedServices.length > 0) {
            if (!allServicesRated) {
                toast.warning('Please rate all services');
                return;
            }
            if (!confirmedServices.every(s => (serviceComments[s.id] || '').trim().length >= 10)) {
                toast.warning('Each service comment must be at least 10 characters');
                return;
            }
        }

        try {
            await onSubmit({
                roomRating,
                roomComment: roomComment.trim(),
                serviceRatings,
                serviceComments: Object.fromEntries(
                    Object.entries(serviceComments).map(([key, val]) => [key, val.trim()])
                ),
            });
            handleReset();
            onClose();
        } catch (err) {
            console.error('Feedback submission error:', err);
        }
    };

    const handleReset = () => {
        setRoomRating(0);
        setRoomComment('');
        setServiceRatings({});
        setServiceComments({});
        setHoveredRoomRating(0);
        setHoveredServiceRatings({});
    };

    const handleCancel = () => {
        handleReset();
        onClose();
    };

    const StarRating = ({ rating, hoveredRating, onRate, onHover, onLeave, size = 'lg' }) => (
        <div className="flex gap-2 justify-center py-3">
            {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onRate(star)}
                    onMouseEnter={() => onHover(star)}
                    onMouseLeave={onLeave}
                    className="focus:outline-none transition-all"
                >
                    <Star
                        className={`transition-all duration-200 ${size === 'lg' ? 'w-9 h-9' : 'w-7 h-7'} ${star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400 scale-110'
                            : 'text-gray-300'
                            }`}
                    />
                </motion.button>
            ))}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
            <DialogContent className="max-w-4xl border-0 bg-gradient-to-b from-white to-gray-50 shadow-2xl rounded-2xl p-0 overflow-hidden max-h-[90vh]">
                {/* Header */}
                <DialogHeader className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6 text-white rounded-t-2xl border-b-0 sticky top-0 z-10">
                    <div className="flex items-center justify-between w-full">
                        <DialogTitle className="text-2xl font-bold text-white">{title}</DialogTitle>
                        <button
                            onClick={handleCancel}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </DialogHeader>

                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-8 p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                    {/* Left Column: Room Rating */}
                    <div className="space-y-6">
                        <div className="border-b-2 pb-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">🏠 Room Feedback</h3>
                        </div>

                        {/* Room Rating */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                Rate the Room (1-5 stars)
                            </label>
                            <StarRating
                                rating={roomRating}
                                hoveredRating={hoveredRoomRating}
                                onRate={setRoomRating}
                                onHover={setHoveredRoomRating}
                                onLeave={() => setHoveredRoomRating(0)}
                                size="lg"
                            />
                            {roomRating > 0 && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center text-sm font-medium text-teal-600"
                                >
                                    {roomRating === 1 && '⭐ Poor'}
                                    {roomRating === 2 && '⭐⭐ Fair'}
                                    {roomRating === 3 && '⭐⭐⭐ Good'}
                                    {roomRating === 4 && '⭐⭐⭐⭐ Very Good'}
                                    {roomRating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                                </motion.p>
                            )}
                        </div>

                        {/* Room Comment */}
                        <div className="space-y-3">
                            <label htmlFor="room-comment" className="block text-sm font-semibold text-gray-700">
                                💭 Your Comment (min 10 chars)
                            </label>
                            <Textarea
                                id="room-comment"
                                placeholder="Share your experience about the room..."
                                value={roomComment}
                                onChange={(e) => handleRoomCommentChange(e.target.value)}
                                className="min-h-32 resize-none rounded-lg border-2 border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all placeholder:text-gray-400 text-sm"
                            />
                            <div className="flex justify-between items-center">
                                <p className={`text-xs ${roomComment.length < 10 ? 'text-red-500' : 'text-green-500'}`}>
                                    {roomComment.length}/10
                                </p>
                                {roomComment.length >= 10 && (
                                    <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-xs text-green-600 font-medium">
                                        ✓ Valid
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Services Rating */}
                    <div className="space-y-6">
                        {confirmedServices.length > 0 ? (
                            <>
                                <div className="border-b-2 pb-4">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">🛎️ Services ({confirmedServices.length})</h3>
                                </div>

                                <div className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto pr-2">
                                    {confirmedServices.map((bookingService, idx) => (
                                        <motion.div
                                            key={bookingService.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-gradient-to-br from-blue-50 to-teal-50 p-4 rounded-xl border border-teal-200 space-y-3"
                                        >
                                            {/* Service Name */}
                                            <div className="font-semibold text-teal-800">
                                                {bookingService.service?.name}
                                            </div>

                                            {/* Service Rating */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-700">Rate this service</label>
                                                <StarRating
                                                    rating={serviceRatings[bookingService.id] || 0}
                                                    hoveredRating={hoveredServiceRatings[bookingService.id] || 0}
                                                    onRate={(rating) => handleServiceRatingChange(bookingService.id, rating)}
                                                    onHover={(rating) => handleServiceHover(bookingService.id, rating)}
                                                    onLeave={() => handleServiceHover(bookingService.id, 0)}
                                                    size="md"
                                                />
                                                {serviceRatings[bookingService.id] > 0 && (
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-center text-xs font-medium text-teal-600"
                                                    >
                                                        {serviceRatings[bookingService.id]}★
                                                    </motion.p>
                                                )}
                                            </div>

                                            {/* Service Comment */}
                                            <div className="space-y-2">
                                                <label htmlFor={`service-comment-${bookingService.id}`} className="text-xs font-semibold text-gray-700">
                                                    Comment (min 10 chars)
                                                </label>
                                                <Textarea
                                                    id={`service-comment-${bookingService.id}`}
                                                    placeholder="Your feedback about this service..."
                                                    value={serviceComments[bookingService.id] || ''}
                                                    onChange={(e) => handleServiceCommentChange(bookingService.id, e.target.value)}
                                                    className="min-h-20 resize-none rounded-lg border border-gray-300 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-200 transition-all placeholder:text-gray-400 text-xs"
                                                />
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-xs ${(serviceComments[bookingService.id] || '').length < 10 ? 'text-red-500' : 'text-green-500'}`}>
                                                        {(serviceComments[bookingService.id] || '').length}/10
                                                    </p>
                                                    {(serviceComments[bookingService.id] || '').length >= 10 && (
                                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green-600 font-medium">
                                                            ✓
                                                        </motion.span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                No services to rate
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-8 py-4 flex gap-3 border-t border-gray-200 bg-white sticky bottom-0">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={roomRating === 0 || roomComment.trim().length < 10 || (confirmedServices.length > 0 && (!allServicesRated || !confirmedServices.every(s => (serviceComments[s.id] || '').trim().length >= 10))) || loading}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Submit Feedback
                            </>
                        )}
                    </Button>
                </div>

                {/* Footer decoration */}
                <div className="h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-600" />
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackModal;
