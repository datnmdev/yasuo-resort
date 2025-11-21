import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import apis from '@apis/index';
import useFetch from '@src/hooks/fetch.hook';
import { Card, Image, Carousel, Pagination, Spin, message } from "antd";
import { Button } from '@ui/button';
import { InputNumber, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function BookingComBoConfirmationPage() {

    // ======================
    // 1. Router Hooks
    // ======================
    const { state } = useLocation();
    const navigate = useNavigate();

    console.log("check state", state);

    // ======================
    // 2. State Variables
    // ======================
    const [servicesInCombo, setServicesInCombo] = useState([]);
    const [listRoomFilterByComboType, setListRoomFilterByComboType] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(3);

    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentRooms = listRoomFilterByComboType?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const totalRooms = listRoomFilterByComboType?.length || 0;

    const [selectedRoom, setSelectedRoom] = useState(null);
    console.log("check selectedRoom", selectedRoom);

    const [guestCount, setGuestCount] = useState(1);
    const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(1, 'day')]);
    const [totalDays, setTotalDays] = useState(2);
    const [totalPriceRoom, setTotalPriceRoom] = useState(0);
    const [totalPriceService, setTotalPriceService] = useState(0);
    const [dateError, setDateError] = useState('');

    const minStayNights = state?.combo?.minStayNights || 1;

    // Voucher
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    console.log("check selectedVoucher", selectedVoucher);

    // ======================
    // 3. API Calls
    // ======================
    const { data: listRoomFromAPI, loading, error } = useFetch(() =>
        apis.room.getRooms({ page: 1, limit: 1000 })
    );

    const { data: listVoucherFromAPI } = useFetch(() =>
        apis.voucher.getVouchersOfCustomer({ page: 1, limit: 1000 })
    );
    console.log("check listVoucherFromAPI", listVoucherFromAPI);

    // ======================
    // 4. Helper Functions
    // ======================
    const calcDiscount = (base, percent, max) =>
        Math.min(base * (percent / 100), max);

    const calculateFinalPriceWithDiscount = () => {
        const base = parseFloat(totalPriceRoom) + parseFloat(totalPriceService);

        const { discountValue, maxDiscountAmount } = state.combo;
        const offCombo = calcDiscount(
            base,
            parseFloat(discountValue),
            parseFloat(maxDiscountAmount)
        );

        return base - offCombo;
    };

    const calculateFinalPriceWithVoucher = () => {
        const priceAfterCombo = calculateFinalPriceWithDiscount();

        if (!selectedVoucher) return priceAfterCombo;

        const { discountValue, maxDiscountAmount } = selectedVoucher.voucher;
        const offVoucher = calcDiscount(
            priceAfterCombo,
            parseFloat(discountValue),
            parseFloat(maxDiscountAmount)
        );

        return priceAfterCombo - offVoucher;
    };

    const isVoucherValid = (voucher, totalAmount) => {
        const currentDate = dayjs();
        const endDate = dayjs(voucher.voucher.endDate);
        const minOrder = parseFloat(voucher.voucher.minBookingAmount);

        return currentDate.isBefore(endDate) && totalAmount >= minOrder;
    };

    // ======================
    // 5. Event Handlers
    // ======================
    const onPageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const handleConfirmBooking = async () => {
        if (!selectedRoom || !dateRange[0] || !dateRange[1]) {
            toast.error('Please select a room and date range');
            return;
        }

        const bookingData = {
            roomId: selectedRoom.id,
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD'),
            comboId: state?.combo?.id,
            capacity: guestCount,
            ...(selectedVoucher?.id && { userVoucherId: selectedVoucher.id }),
            attachedService: servicesInCombo.map(service => ({
                id: service.service.id,
                quantity: guestCount,
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD')
            }))
        };
        console.log("check bookingData", bookingData);

        try {
            const response = await apis.booking.bookingRoom(bookingData);
            if (response.statusCode === 200) {
                toast.success('Booking created successfully!');
            } else {
                toast.error(response.message || 'Failed to create booking');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            message.error(error.response?.data?.message || 'An error occurred while creating the booking');
        }
    };

    // ======================
    // 6. useEffect Hooks
    // ======================
    useEffect(() => {
        if (listRoomFromAPI?.data?.[0]) {
            const filtered = listRoomFromAPI.data[0].filter(
                item => item?.typeId === state?.combo?.roomTypeId
            );
            setListRoomFilterByComboType(filtered);
        } else {
            setListRoomFilterByComboType([]);
        }

        if (state?.combo?.comboServices?.length > 0) {
            setServicesInCombo(state.combo.comboServices);
        }
    }, [listRoomFromAPI, state?.combo?.roomTypeId]);

    useEffect(() => {
        if (selectedRoom && servicesInCombo.length > 0) {
            const totalService = servicesInCombo.reduce(
                (sum, service) =>
                    sum + (parseFloat(service.service.price) * guestCount * totalDays),
                0
            );

            setTotalPriceService(totalService.toFixed(2));
            setTotalPriceRoom((selectedRoom.price * totalDays).toFixed(2));

        } else {
            setTotalPriceService('0.00');
            setTotalPriceRoom('0.00');
        }
    }, [selectedRoom, guestCount, totalDays, servicesInCombo]);


    //component voucher
    const VoucherList = () => {

        if (listVoucherFromAPI?.data?.length === 0) {
            return (
                <div className="text-center py-4 text-gray-500">
                    No vouchers available
                </div>
            );
        }
        const totalAmount = (parseFloat(totalPriceRoom) + parseFloat(totalPriceService)) || 0;

        return (
            // <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            //     {listVoucherFromAPI?.data?.[0].map((voucher) => (
            //         <div
            //             key={voucher.id}
            //             className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedVoucher?.id === voucher.id
            //                 ? 'border-teal-500 bg-teal-50'
            //                 : 'border-gray-200 hover:border-teal-300'
            //                 }`}
            //             onClick={() => setSelectedVoucher(voucher)}
            //         >
            //             <div className="flex justify-between items-start">
            //                 <div>
            //                     <h4 className="font-medium text-teal-700">{voucher.voucher.name}</h4>
            //                     <p className="text-sm text-gray-600">
            //                         {voucher.voucher.discountValue}% OFF
            //                         {voucher.voucher.maxDiscountAmount &&
            //                             ` (max $${voucher.voucher.maxDiscountAmount})`
            //                         }
            //                     </p>
            //                     <p className="text-xs text-gray-500 mt-1">
            //                         Min order: ${voucher.voucher.minBookingAmount}
            //                     </p>
            //                     <p className="text-xs text-gray-500">
            //                         Expires: {dayjs(voucher.voucher.endDate).format('DD/MM/YYYY')}
            //                     </p>
            //                 </div>
            //                 {selectedVoucher?.id === voucher.id && (
            //                     <CheckCircle className="h-5 w-5 text-teal-500" />
            //                 )}
            //             </div>
            //         </div>
            //     ))}
            // </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {listVoucherFromAPI?.data?.[0]?.map((voucher) => {
                    const isValid = isVoucherValid(voucher, totalAmount);
                    const isSelected = selectedVoucher?.id === voucher.id;

                    return (
                        <div
                            key={voucher.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${isSelected
                                ? 'border-teal-500 bg-teal-50'
                                : isValid
                                    ? 'border-gray-200 hover:border-teal-300'
                                    : 'border-red-200 bg-red-50'
                                }`}
                            onClick={() => {
                                if (isValid) {
                                    setSelectedVoucher(voucher);
                                }
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className={`font-medium ${isValid ? 'text-teal-700' : 'text-red-600'
                                        }`}>
                                        {voucher.voucher.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {voucher.voucher.discountValue}% OFF
                                        {voucher.voucher.maxDiscountAmount &&
                                            ` (max $${voucher.voucher.maxDiscountAmount})`
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Min order: ${voucher.voucher.minBookingAmount}
                                    </p>
                                    <p className={`text-xs ${dayjs().isBefore(dayjs(voucher.voucher.endDate))
                                        ? 'text-gray-500'
                                        : 'text-red-500'
                                        }`}>
                                        Expires: {dayjs(voucher.voucher.endDate).format('DD/MM/YYYY')}
                                    </p>
                                    {!isValid && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {totalAmount < voucher.voucher.minBookingAmount
                                                ? `Minimum order must be $${voucher.voucher.minBookingAmount}`
                                                : 'This voucher has expired'}
                                        </p>
                                    )}
                                </div>
                                {isSelected && (
                                    <CheckCircle className="h-5 w-5 text-teal-500" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };
    const SelectedRoomCard = ({ room, onRemove }) => {
        if (!room) return null;

        return (
            <div className="p-4 rounded-lg">
                <div className="flex flex-col md:flex-row gap-4">
                    {room.media?.[0] && (
                        <div className="w-full md:w-1/3">
                            <Image
                                src={`${baseUrl}/${room.media[0].path}`}
                                alt={room.roomNumber}
                                width={"100%"}
                                height={250}
                                className="rounded-lg object-cover w-full h-full"
                            />
                        </div>
                    )}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-teal-600">
                                Room {room.roomNumber} - {room.type?.name}
                            </h3>
                            <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: room.description }} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Guest Count */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Guests
                                </label>
                                <InputNumber
                                    min={1}
                                    max={room.maxPeople}
                                    value={guestCount}
                                    onChange={(value) => {
                                        if (value <= room.maxPeople) {
                                            setGuestCount(value);
                                        }
                                    }}
                                    onStep={(value, info) => {
                                        const newValue = info.type === 'up'
                                            ? Math.min(guestCount + 1, room.maxPeople)
                                            : Math.max(guestCount - 1, 1);
                                        setGuestCount(newValue);
                                    }}
                                    className="w-full"
                                    type="number"
                                    parser={(value) => Math.min(parseInt(value || 1, 10), room.maxPeople)}
                                    formatter={(value) => `${value}`}
                                    onKeyDown={(e) => {
                                        // Prevent typing
                                        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'Backspace') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Maximum: {room.maxPeople} guests
                                </p>
                            </div>

                            {/* Date Range Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stay Duration
                                </label>
                                <DatePicker.RangePicker
                                    value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
                                    onChange={(dates) => {
                                        if (dates && dates[0] && dates[1]) {
                                            const nights = dates[1].diff(dates[0], 'days') + 1;
                                            if (nights < minStayNights) {
                                                setDateError(`Minimum stay for this combo is ${minStayNights} days`);
                                            } else {
                                                setDateError('');
                                            }
                                            setTotalDays(nights);
                                            setDateRange([dates[0], dates[1]]);
                                        }
                                    }}
                                    className="w-full"
                                    disabledDate={(current) => {
                                        return current && current < dayjs().startOf('day');
                                    }}
                                    format="DD/MM/YYYY"
                                    showTime={false}
                                    allowClear={false}
                                />
                                {dateError && (
                                    <div className="text-red-500 text-sm mt-1">{dateError}</div>
                                )}
                            </div>
                        </div>

                        {/* Price Summary */}
                        {dateRange[0] && dateRange[1] && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Price Details</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>${room?.price || 0} x {totalDays} {totalDays > 1 ? 'days' : 'day'}</span>
                                        <span>${((room?.price || 0) * (totalDays)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    size="sm"
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                    onClick={onRemove}
                >
                    Remove
                </Button>
            </div>
        );
    };

    return (
        <>
            {/* render danh sách phòng tương ứng roomtype của combo */}
            <div className="container mx-auto grid gap-6 my-4">

                {/* Danh sách phòng */}
                <div className="w-full">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {currentRooms.map((room) => (
                                    <Card
                                        key={room.id}
                                        hoverable
                                        className="rounded-xl shadow-md overflow-hidden"
                                    >
                                        {/* Carousel images */}
                                        {room.media?.length > 0 && (
                                            <Carousel autoplay dots>
                                                {room.media.map((img) => (
                                                    <div key={img.id}>
                                                        <Image
                                                            src={`${baseUrl}/${img.path}`}
                                                            alt={room.roomNumber}
                                                            width="100%"
                                                            height={200}
                                                            className="object-cover rounded-t-xl"
                                                        />
                                                    </div>
                                                ))}
                                            </Carousel>
                                        )}
                                        <h2 className="text-xl font-semibold mb-1 text-teal-600">{room.roomNumber}</h2>
                                        <p className="text-gray-700 mb-1"><strong>Name:</strong> {room.type?.name}</p>
                                        <p className="text-gray-700 mb-1"><strong>Price:</strong> ${room.price}</p>
                                        <p className="text-gray-700"><strong>Max People:</strong> {room.maxPeople}</p>
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-teal-600 hover:bg-teal-700"
                                            onClick={() => setSelectedRoom(room)}
                                        >
                                            {selectedRoom?.id === room.id ? 'Selected' : 'Select Room'}
                                        </Button>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={totalRooms}
                                    onChange={onPageChange}
                                    showSizeChanger
                                    pageSizeOptions={['6', '12', '24', '48']}
                                    showTotal={(total) => `Total ${total} rooms`}
                                    className="mt-4"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* 2 cột: phòng đã chọn (2/3) + voucher (1/3) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Phòng đã chọn: 2/3 */}
                    <div className="md:col-span-8 bg-white p-4 rounded-xl shadow">
                        <h3 className="text-lg font-semibold mb-4">Selected Room</h3>
                        {selectedRoom ? (
                            <SelectedRoomCard
                                room={selectedRoom}
                                onRemove={() => setSelectedRoom(null)}
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No room selected yet</p>
                                <p className="text-sm mt-2">Please select a room from the list above</p>
                            </div>
                        )}
                    </div>

                    {/* Danh sách voucher: 1/3 */}
                    <div className="md:col-span-4 bg-white p-4 rounded-xl shadow">
                        <VoucherList />
                        {selectedVoucher && (
                            <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-teal-700">Selected Voucher</p>
                                        <p className="text-sm">{selectedVoucher.voucher.name}</p>
                                    </div>
                                    <Button
                                        type="link"
                                        danger
                                        size="small"
                                        className="bg-teal-600 hover:bg-teal-700 p-2"
                                        onClick={() => setSelectedVoucher(null)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Danh sách dịch vụ */}
                <div id="services-section" className="bg-white p-6 rounded-xl shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {servicesInCombo.length === 0 ? (
                            <div className="col-span-3 text-center py-8 text-gray-500">
                                No services available
                            </div>
                        ) : (
                            servicesInCombo?.map((service) => {
                                return (
                                    <div
                                        key={service.id}
                                        className="p-4 border border-green-500 bg-green-50 rounded-lg"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{service.service.name}</h4>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2"
                                                    dangerouslySetInnerHTML={{ __html: service.service.description }} />
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-blue-600">
                                                    ${service.service.price}
                                                </div>
                                                <div className="flex items-center justify-end">
                                                    <span className="text-xs text-green-600 mr-1">Included</span>
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Hiển thị tổng tiền dịch vụ đã chọn */}
                    {servicesInCombo.length > 0 && (
                        <div className="mt-6 pt-4 border-t">
                            <h4 className="font-medium mb-2 text-lg text-teal-600">Summary Services</h4>
                            <div className="space-y-2">
                                {servicesInCombo.map(service => (
                                    <div key={service.id} className="flex justify-between">
                                        <span>{service.service.name}</span>
                                        <span>${parseFloat(service.service.price).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between font-semibold text-lg mt-4 pt-2 border-t">
                                <span className="text-teal-600">Services Total:</span>
                                <span>${totalPriceService}</span>
                            </div>
                            <div className="text-gray-500 text-sm">
                                total days X total price service X people
                            </div>
                        </div>
                    )}
                </div>

                {/* Thanh toán */}
                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>

                    {/* Room Price */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Room Price ({totalDays} {totalDays > 1 ? 'days' : 'day'})</span>
                            <span>${totalPriceRoom}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total services price</span>
                            <span>${totalPriceService}</span>
                        </div>
                    </div>

                    {/* Combo Discount */}
                    {state?.combo?.discountValue > 0 && (
                        <div className="border-t pt-3 mb-3">
                            <div className="flex justify-between">
                                <span>Combo Discount ({state.combo.discountValue}%)</span>
                                <span className="text-green-600">
                                    ${calculateFinalPriceWithDiscount()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Voucher Discount */}
                    {selectedVoucher && (
                        <div className="border-t pt-3 mb-3">
                            <div className="flex justify-between">
                                <span>Voucher: {selectedVoucher.voucher.name} ({selectedVoucher.voucher.discountValue}%)</span>
                                <span className="text-green-600">
                                    ${calculateFinalPriceWithVoucher()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="border-t pt-3">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total Amount</span>
                            <span>
                                ${selectedVoucher ? calculateFinalPriceWithVoucher() : calculateFinalPriceWithDiscount()}
                            </span>
                        </div>
                    </div>
                </div>

                <Button
                    type="primary"
                    size="small"
                    className="bg-teal-600 hover:bg-teal-700 p-2 mb-6"
                    onClick={handleConfirmBooking}
                >
                    Confirm Booking
                </Button>

            </div>

        </>
    );
}
