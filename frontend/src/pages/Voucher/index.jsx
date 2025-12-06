import React, { useState, useMemo, useEffect } from 'react';
import useFetch from '../../hooks/fetch.hook';
import apis from '../../apis/index';
import { toast } from 'react-toastify';
import { Button, Modal, Tag, Typography, Card, Alert } from 'antd';
import { Button as ButtonUI } from '@ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    InfoCircleOutlined,
    GiftOutlined,
    CalendarOutlined,
} from '@ant-design/icons';



const Voucher = () => {

    const { data: listVoucher } = useFetch(() =>
        apis.voucher.getVouchersForAll({ page: 1, limit: 100 })
    );

    useEffect(() => {
        console.log("kiểm tra danh sách voucher", listVoucher)
    }, [listVoucher])

    const handleClaim = async (voucherId) => {
        try {
            const res = await apis.voucher.claimVoucher({ id: voucherId });

            if (res?.data?.isSuccess) {
                toast.success("Voucher claimed successfully!");
            } else {
                toast.error(res?.data?.error?.message || "Failed to claim voucher.");
            }
        } catch (error) {
            toast.error(error?.response?.data?.error?.message || "Something went wrong!");
        }
    };

    return (
        <div className="container mx-auto min-h-screen py-6">
            <h2 className="text-2xl font-semibold mb-4">Voucher List</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listVoucher?.data?.[0]?.map((item) => (
                    <Card
                        key={item.id}
                        className="border rounded-lg shadow-sm"
                        title={
                            <div className="flex items-center gap-2 text-teal-700 font-bold">
                                <GiftOutlined className="text-lg" />
                                {item.name}
                            </div>
                        }
                    >
                        <p className="text-gray-700 mb-2">{item.description}</p>

                        <div className="flex items-center gap-2 mb-2">
                            <Tag color="green">
                                Discount: {item.discountValue}
                                {item.discountType === 'percentage' ? '%' : 'đ'}
                            </Tag>
                            <Tag color="blue">
                                Min Booking: {item.minBookingAmount}
                            </Tag>
                        </div>

                        <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                            <CalendarOutlined />
                            <span>Start Date: {item.startDate?.slice(0, 10)}</span>
                        </div>

                        <div className="text-sm text-gray-600 flex items-center gap-2">
                            <CalendarOutlined />
                            <span>End Date: {item.endDate?.slice(0, 10)}</span>
                        </div>

                        <div className="mt-3">
                            <Tag color="purple">Claim Limit: {item.claimLimit}</Tag>
                        </div>

                        <div className="mt-3">
                            <span className="font-semibold">Applicable Tiers:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {item.userTiers?.map((tier) => (
                                    <Tag color="cyan" key={tier.id}>
                                        {tier.tierName}
                                    </Tag>
                                ))}
                            </div>
                        </div>
                        <div className="mt-auto flex justify-end">
                            <ButtonUI
                                className="bg-gray-300"
                                onClick={() => handleClaim(item.id)}
                            >
                                Claim
                            </ButtonUI>
                        </div>
                    </Card>
                ))}
            </div>
        </div>


    );
};

export default Voucher;
