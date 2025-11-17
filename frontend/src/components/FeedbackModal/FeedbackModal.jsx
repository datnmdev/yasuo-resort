import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';
import { Button } from '@ui/button';
import { Textarea } from '@ui/textarea';
import { Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Rating from '@components/Rating/Rating';

const FeedbackModal = ({ isOpen, onClose, title = 'Share Your Feedback', onSubmit, loading = false, bookingServices = [] }) => {
    const [feedbackType, setFeedbackType] = useState('room');

    // room
    const [roomRating, setRoomRating] = useState(0);
    const [roomTouched, setRoomTouched] = useState(false);
    const [roomComment, setRoomComment] = useState('');

    // services keyed by bookingService.id
    const [serviceRatings, setServiceRatings] = useState({});
    const [serviceTouched, setServiceTouched] = useState({});
    const [serviceComments, setServiceComments] = useState({});

    const confirmedServices = bookingServices.filter((s) => s.status === 'confirmed');
    const [selectedBookingServiceId, setSelectedBookingServiceId] = useState(confirmedServices[0]?.id || null);

    useEffect(() => {
        setSelectedBookingServiceId(confirmedServices[0]?.id || null);
    }, [bookingServices]);

    // helpers
    const handleServiceRatingChange = (bookingServiceId, rating) => {
        setServiceRatings((prev) => ({ ...prev, [bookingServiceId]: rating }));
        setServiceTouched((prev) => ({ ...prev, [bookingServiceId]: true }));
        setSelectedBookingServiceId(bookingServiceId);
        console.debug('[FeedbackModal] rating set', { bookingServiceId, rating });
    };

    const handleServiceCommentChange = (bookingServiceId, text) => {
        setServiceComments((prev) => ({ ...prev, [bookingServiceId]: text }));
        console.debug('[FeedbackModal] comment set', { bookingServiceId, text });
    };

    const isRoomValid = roomTouched ? roomRating > 0 && (roomComment || '').trim().length > 0 : false;

    const isSelectedServiceValid = (() => {
        if (!selectedBookingServiceId) return false;
        if (!serviceTouched[selectedBookingServiceId]) return false;
        const r = serviceRatings[selectedBookingServiceId] || 0;
        const c = (serviceComments[selectedBookingServiceId] || '').trim().length;
        return r > 0 && c > 0;
    })();

    const hasAnyTouchedServiceWithComment = confirmedServices.some((s) => {
        const touched = !!serviceTouched[s.id];
        const r = serviceRatings[s.id] || 0;
        const c = (serviceComments[s.id] || '').trim().length;
        return touched && r > 0 && c > 0;
    });

    let isFormValid = false;
    if (feedbackType === 'room') isFormValid = isRoomValid;
    else if (feedbackType === 'service') isFormValid = isSelectedServiceValid;
    else if (feedbackType === 'combo') isFormValid = isRoomValid || hasAnyTouchedServiceWithComment;

    useEffect(() => {
        console.debug('[FeedbackModal] isFormValid', isFormValid);
    }, [isFormValid]);

    const handleReset = () => {
        setRoomRating(0);
        setRoomTouched(false);
        setRoomComment('');
        setServiceRatings({});
        setServiceTouched({});
        setServiceComments({});
    };

    const handleCancel = () => {
        handleReset();
        onClose();
    };

    const handleSubmit = async () => {
        if (!isFormValid) {
            toast.warning('Vui lòng cung cấp đầy đủ đánh giá và bình luận (comment)');
            return;
        }

        try {
            // build payload: include room feedback if roomTouched and rating>0
            const payloadRoom = roomTouched && roomRating > 0 && (roomComment || '').trim().length > 0
                ? { roomRating, roomComment: roomComment.trim() }
                : null;

            // include only services that user touched and rated >0
            const sr = {};
            const sc = {};
            confirmedServices.forEach((s) => {
                const r = serviceRatings[s.id] || 0;
                const touched = !!serviceTouched[s.id];
                if (touched && r > 0) {
                    sr[s.id] = r;
                    sc[s.id] = (serviceComments[s.id] || '').trim();
                }
            });

            const payload = {
                roomRating: payloadRoom ? payloadRoom.roomRating : 0,
                roomComment: payloadRoom ? payloadRoom.roomComment : '',
                serviceRatings: sr,
                serviceComments: sc,
            };

            await onSubmit(payload);
            toast.success('Cảm ơn phản hồi của bạn!');
            handleReset();
            onClose();
        } catch (err) {
            console.error('Feedback submission error:', err);
            toast.error('Failed to submit feedback');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
            <DialogContent className="max-w-3xl bg-white rounded-lg shadow-lg p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 bg-teal-600 text-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
                        <button onClick={handleCancel} className="text-white/80 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </DialogHeader>

                <div className="px-6 py-4">
                    <div className="mb-4">
                        <div className="flex gap-2">
                            <button className={`px-3 py-1 rounded ${feedbackType === 'room' ? 'bg-white shadow' : 'bg-gray-100'}`} onClick={() => setFeedbackType('room')}>Phòng</button>
                            <button className={`px-3 py-1 rounded ${feedbackType === 'service' ? 'bg-white shadow' : 'bg-gray-100'}`} onClick={() => { setFeedbackType('service'); setSelectedBookingServiceId(confirmedServices[0]?.id || null); }}>Dịch vụ</button>
                            <button className={`px-3 py-1 rounded ${feedbackType === 'combo' ? 'bg-white shadow' : 'bg-gray-100'}`} onClick={() => setFeedbackType('combo')}>Combo</button>
                        </div>
                    </div>

                    {feedbackType === 'room' && (
                        <div className="space-y-4">
                            <div>
                                <div className="font-semibold">🏠 Đánh giá phòng</div>
                                <div className="mt-2">
                                    <Rating value={roomTouched ? roomRating : 5} onChange={(r) => { setRoomRating(r); setRoomTouched(true); }} size="lg" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Bình luận (bắt buộc)</label>
                                <Textarea value={roomComment} onChange={(e) => setRoomComment(e.target.value)} placeholder="Chia sẻ trải nghiệm của bạn về phòng" className="mt-2" />
                            </div>
                        </div>
                    )}

                    {feedbackType === 'service' && (
                        <div className="space-y-4">
                            {confirmedServices.length === 0 ? (
                                <div className="text-sm text-gray-500">Không có dịch vụ để đánh giá</div>
                            ) : (
                                confirmedServices.map((bs, idx) => (
                                    <motion.div key={bs.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="p-3 rounded border bg-gray-50">
                                        <div className="font-medium">{bs.service?.name}</div>
                                        <div className="mt-2">
                                            <Rating value={serviceTouched[bs.id] ? (serviceRatings[bs.id] || 0) : 5} onChange={(r) => handleServiceRatingChange(bs.id, r)} size="md" />
                                        </div>
                                        <div className="mt-2">
                                            <label className="text-sm">Bình luận (bắt buộc nếu đã đánh giá)</label>
                                            <Textarea value={serviceComments[bs.id] || ''} onChange={(e) => handleServiceCommentChange(bs.id, e.target.value)} placeholder="Nhận xét về dịch vụ" className="mt-2" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}

                    {feedbackType === 'combo' && (
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="font-semibold">🏠 Đánh giá phòng</div>
                                <div className="mt-2">
                                    <Rating value={roomTouched ? roomRating : 5} onChange={(r) => { setRoomRating(r); setRoomTouched(true); }} size="lg" />
                                </div>
                                <div className="mt-3">
                                    <label className="text-sm">Bình luận (bắt buộc nếu đánh giá)</label>
                                    <Textarea value={roomComment} onChange={(e) => setRoomComment(e.target.value)} placeholder="Nhận xét về phòng" className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <div className="font-semibold mb-2">Dịch vụ</div>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {confirmedServices.length === 0 ? (
                                        <div className="text-sm text-gray-500">Không có dịch vụ</div>
                                    ) : (
                                        confirmedServices.map((bs) => (
                                            <div key={bs.id} className="p-2 rounded bg-gray-50 border">
                                                <div className="font-medium">{bs.service?.name}</div>
                                                <div className="mt-2">
                                                    <Rating value={serviceTouched[bs.id] ? (serviceRatings[bs.id] || 0) : 5} onChange={(r) => handleServiceRatingChange(bs.id, r)} size="md" />
                                                </div>
                                                <div className="mt-2">
                                                    <Textarea value={serviceComments[bs.id] || ''} onChange={(e) => handleServiceCommentChange(bs.id, e.target.value)} placeholder="Nhận xét về dịch vụ" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t flex gap-3 justify-between items-center bg-white">
                    <div>
                        {isFormValid ? (
                            <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded">FORM VALID</span>
                        ) : (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded">FORM INVALID</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={handleCancel} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!isFormValid || loading} className="flex items-center gap-2">
                            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Send className="w-4 h-4" />}
                            Submit
                        </Button>
                    </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-600" />
                <div className="p-2 text-xs text-red-600">DEBUG: roomTouched: {String(roomTouched)} | isRoomValid: {String(isRoomValid)} | selectedServiceValid: {String(isSelectedServiceValid)} | hasAnyTouchedServiceWithComment: {String(hasAnyTouchedServiceWithComment)} | isFormValid: {String(isFormValid)} | selectedBookingServiceId: {String(selectedBookingServiceId)}</div>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackModal;
