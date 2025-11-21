import React, { useEffect, useState } from "react";
import useFetch from "../../hooks/fetch.hook";
import apis from "../../apis/index";
import { useSelector } from "react-redux";
import { userSelector } from "../../stores/reducers/userReducer";
import { Button, Card, Image, Tag, Modal, Form, Rate, Input, Tabs, message } from "antd";
import { formatCurrencyUSD } from "@libs/utils";
import dayjs from "dayjs";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { toast } from 'react-toastify';

export default function BookingHistory() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const user = useSelector(userSelector.selectUser);

    // Fetch all required data
    const { data: bookingsData } = useFetch(() =>
        apis.booking.getBookings({ page: 1, limit: Number.MAX_SAFE_INTEGER })
    );
    const { data: roomsData } = useFetch(() =>
        apis.room.getRooms({ page: 1, limit: Number.MAX_SAFE_INTEGER })
    );
    const { data: servicesData } = useFetch(() =>
        apis.service.getServices({ page: 1, limit: Number.MAX_SAFE_INTEGER })
    );

    useEffect(() => {
        if (
            !user ||
            !bookingsData?.data?.[0] ||
            !roomsData?.data?.[0] ||
            !servicesData?.data?.[0]
        ) {
            return;
        }

        const currentDate = new Date();
        const bookingsList = bookingsData.data[0];
        const roomsList = roomsData.data[0];
        const servicesList = servicesData.data[0];

        const filteredBookings = bookingsList
            .filter(
                (booking) =>
                    booking.userId === user.id &&
                    booking.status === "confirmed" &&
                    new Date(booking.endDate) < currentDate
            )
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        const combined = filteredBookings.map((booking) => {
            const room = roomsList.find((r) => r.id === booking.roomId) || null;

            const services = booking.bookingServices
                ?.filter(bs => bs.status === "confirmed")
                ?.map((bs) => servicesList.find((s) => s.id === bs.serviceId))
                .filter(Boolean) || [];

            return {
                ...booking,
                room,
                services,
                key: booking.id,
            };
        });

        setBookings(combined);
        setLoading(false);
    }, [bookingsData, roomsData, servicesData, user]);

    const showModal = (booking) => {
        setSelectedBooking(booking);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // ----------- Review Handlers -----------
    const handleRoomReview = async (values) => {
        try {
            await apis.user.createFeedback({
                bookingId: selectedBooking.id,
                rating: values.roomRating,
                comment: values.roomComment,
                targetType: 'room',
                targetId: selectedBooking.roomId
            });
            toast.success('Room review submitted successfully!');
            setIsModalVisible(false);
        } catch (error) {
            if (error.response?.data?.error?.code === 'Conflict') {
                toast.warning('You have already reviewed this room');
            } else {
                toast.error('An error occurred while submitting your review');
            }
        }
    };

    const handleServiceReview = async (serviceId, values) => {
        try {
            await apis.user.createFeedback({
                bookingId: selectedBooking.id,
                rating: values.serviceRating,
                comment: values.serviceComment,
                targetType: 'service',
                targetId: serviceId
            });
            toast.success('Service review submitted successfully!');
        } catch (error) {
            if (error.response?.data?.error?.code === 'Conflict') {
                toast.warning('You have already reviewed this service');
            } else {
                toast.error('An error occurred while submitting your service review');
            }
        }
    };

    const handleComboReview = async (values) => {
        try {
            await apis.user.createFeedback({
                bookingId: selectedBooking.id,
                rating: values.comboRating,
                comment: values.comboComment,
                targetType: 'combo',
                targetId: selectedBooking.comboId
            });
            toast.success('Combo review submitted successfully!');
            setIsModalVisible(false);
        } catch (error) {
            if (error.response?.data?.error?.code === 'Conflict') {
                toast.warning('You have already reviewed this combo');
            } else {
                toast.error('An error occurred while submitting your combo review');
            }
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold mb-6 text-[#0d584d]">Booking History</h2>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0d584d]"></div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            You don't have any bookings yet
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.map((booking) => (
                                <Card
                                    key={booking.id}
                                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="aspect-[4/3] overflow-hidden mb-2">
                                        <Image
                                            alt="Room"
                                            src={`${import.meta.env.VITE_API_BASE_URL}/${booking?.room?.media?.[0]?.path}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-semibold">
                                                {booking.room?.roomNumber} - {booking.room?.type?.name}
                                            </h3>
                                            <Tag color="green" className="m-0">
                                                Ended
                                            </Tag>
                                        </div>

                                        <div className="text-gray-600 space-y-1">
                                            <div className="flex items-center">
                                                <CalendarOutlined className="mr-2" />
                                                <span>
                                                    {dayjs(booking.startDate).format('DD/MM/YYYY')} -{' '}
                                                    {dayjs(booking.endDate).format('DD/MM/YYYY')}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <UserOutlined className="mr-2" />
                                                <span>{booking.user?.name || 'N/A'}</span>
                                            </div>
                                            <div className="font-semibold text-[#0d584d] text-lg">
                                                {formatCurrencyUSD(booking.totalPrice)}
                                            </div>
                                        </div>

                                        {booking.services?.length > 0 && (
                                            <div className="pt-2 border-t border-gray-100">
                                                <div className="text-sm font-medium text-gray-500 mb-1">Services:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {booking.services.map((service) => (
                                                        <Tag key={service.id} color="blue">
                                                            {service.name}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="primary"
                                        className="w-full mt-4 bg-[#009689] hover:bg-[#007f73] border-none text-white transition-colors duration-300"
                                        size="large"
                                        onClick={() => showModal(booking)}
                                    >
                                        Review
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ----------- Modal Review ----------- */}
            <Modal
                title="Share your experience"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                <Tabs
                    defaultActiveKey="room"
                    items={[
                        {
                            key: 'room',
                            label: 'Room',
                            children: (
                                <Form onFinish={handleRoomReview} layout="vertical">
                                    <Form.Item
                                        name="roomRating"
                                        label="Room rating"
                                        rules={[{ required: true, message: 'Please select a star rating' }]}
                                    >
                                        <Rate allowHalf />
                                    </Form.Item>

                                    <Form.Item
                                        name="roomComment"
                                        label="Room review"
                                        rules={[{ required: true, message: 'Please enter your review' }]}
                                    >
                                        <Input.TextArea rows={4} placeholder="Share your thoughts about the room..." />
                                    </Form.Item>

                                    <div className="flex justify-end gap-2">
                                        <Button onClick={handleCancel}>Cancel</Button>
                                        <Button type="primary" htmlType="submit">Submit review</Button>
                                    </div>
                                </Form>
                            )
                        },

                        {
                            key: 'services',
                            label: 'Services',
                            children: (
                                <div className="space-y-4">
                                    {selectedBooking?.services?.map(service => (
                                        <div key={service.id} className="p-4 border rounded">
                                            <h4 className="font-medium mb-2">{service.name}</h4>

                                            <Form onFinish={(values) => handleServiceReview(service.id, values)}>
                                                <Form.Item
                                                    name="serviceRating"
                                                    label="Rating"
                                                    rules={[{ required: true, message: 'Please select a star rating' }]}
                                                >
                                                    <Rate allowHalf />
                                                </Form.Item>

                                                <Form.Item
                                                    name="serviceComment"
                                                    label="Review"
                                                    rules={[{ required: true, message: 'Please enter your review' }]}
                                                >
                                                    <Input.TextArea
                                                        rows={3}
                                                        placeholder={`Write your review for ${service.name}`}
                                                    />
                                                </Form.Item>

                                                <div className="text-right">
                                                    <Button type="primary" htmlType="submit">Submit review</Button>
                                                </div>
                                            </Form>
                                        </div>
                                    ))}
                                </div>
                            )
                        },

                        ...(selectedBooking?.comboId
                            ? [{
                                key: 'combo',
                                label: 'Combo',
                                children: (
                                    <Form onFinish={handleComboReview} layout="vertical">
                                        <Form.Item
                                            name="comboRating"
                                            label="Combo rating"
                                            rules={[{ required: true, message: 'Please select a star rating' }]}
                                        >
                                            <Rate allowHalf />
                                        </Form.Item>

                                        <Form.Item
                                            name="comboComment"
                                            label="Combo review"
                                            rules={[{ required: true, message: 'Please enter your review' }]}
                                        >
                                            <Input.TextArea
                                                rows={4}
                                                placeholder="Share your thoughts about the combo..."
                                            />
                                        </Form.Item>

                                        <div className="flex justify-end gap-2">
                                            <Button onClick={handleCancel}>Cancel</Button>
                                            <Button type="primary" htmlType="submit">Submit review</Button>
                                        </div>
                                    </Form>
                                )
                            }]
                            : [])
                    ]}
                />
            </Modal>
        </>
    );
}
