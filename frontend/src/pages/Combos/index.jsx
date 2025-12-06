import React, { useState, useEffect } from 'react';
import useFetch from '@src/hooks/fetch.hook';
import apis from '@apis/index';
import { Card, Image, Tag } from 'antd';
import { Button } from '@ui/button';
import { useNavigate } from 'react-router';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { Eye, MapPin, Users, Heart } from 'lucide-react';

const Combos = () => {
    const navigate = useNavigate();
    const { data: listComboFromAPI } = useFetch(() => apis.booking.getCombosForAll({ page: 1, limit: 1000 }))
    const handleBookCombo = (combo) => {
        navigate(`/booking-combo/${combo.id}`, {
            state: { combo },
        });
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center">
                <p className="text-gray-600 mt-1 text-2xl text-teal-700 my-4">
                    Premium combos combining comfort and style for a truly exceptional stay.
                </p>
            </div>
            <div className="container mx-auto min-h-screen">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {listComboFromAPI?.data?.[0].map((combo) => (
                        <Card
                            key={combo.id}
                            hoverable
                            className="rounded-xl shadow-md"
                            bodyStyle={{ padding: "20px" }}
                        >
                            {/* render nội dung 1 card */}
                            <div className='border-gray-200 rounded-xl overflow-hidden'>
                                <div className='border-gray-200 rounded-xl overflow-hidden'>
                                    <Image
                                        width={"100%"}
                                        src="https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2016/12/14524623_1122507874452688_5292429852679961429_o.jpg"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold mb-2 text-teal-600">{combo.name}</h2>

                                <p className="mb-1 text-teal-600">{combo.description}</p>

                                <p className="mb-1">
                                    <span className="font-semibold">Discount:</span> <Tag color="red">{combo.discountValue}%</Tag>
                                </p>

                                <p className="mb-1">
                                    <span className="font-semibold">Max discount amount: </span>
                                    <Tag color="red">{combo.maxDiscountAmount}</Tag>
                                    <Tag color="red">USD</Tag>
                                </p>

                                <p className="mb-1">
                                    <span className="font-semibold">Min stay days: </span>
                                    <Tag color="blue">{combo.minStayNights} days</Tag>
                                </p>
                                <p className="mb-1">
                                    <span className="font-semibold">Room type: </span>
                                    <Tag color="blue">{combo.roomType.name}</Tag>
                                </p>
                            </div>
                            {/* render button của card */}
                            <div className='flex justify-between items-center mt-4 gap-4'>
                                {/* <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                </Button> */}
                                <Button
                                    size="sm"
                                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                                    onClick={() => {
                                        const accessToken = Cookies.get('accessToken');
                                        if (!accessToken) {
                                            toast.warning('Please log in before booking a combo!');
                                            setTimeout(() => navigate('/login'), 3000);
                                            return;
                                        }
                                        handleBookCombo(combo)
                                    }}
                                >
                                    Book Now
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Combos;