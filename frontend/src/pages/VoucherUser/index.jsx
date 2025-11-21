import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useFetch from '../../hooks/fetch.hook';
import apis from '../../apis/index';
import { formatCurrencyUSD } from '../../libs/utils';
import { Link } from 'react-router';

const { Title } = Typography;

const VoucherUser = () => {
    const [listVoucher, setListVoucher] = useState([]);
    const { data: listVoucherOfUserFromApi } = useFetch(() =>
        apis.voucher.getVouchersOfCustomer({ page: 1, limit: 100 })
    );

    useEffect(() => {
        const listTemp = listVoucherOfUserFromApi?.data?.[0] || [];
        if (listTemp.length > 0) {
            setListVoucher(listTemp.map(item => ({
                code: item.id,
                discountValue: item.voucher.discountValue,
                minBookingAmount: item.voucher.minBookingAmount,
                maxDiscountAmount: item.voucher.maxDiscountAmount,
                endDate: item.voucher.endDate,
                isUsed: !!item.dateUsed,
                key: item.id
            })));
        }
    }, [listVoucherOfUserFromApi])

    const columns = [
        {
            title: 'Voucher Code',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <span className="font-medium">{text}</span>,
        },
        {
            title: 'Discount',
            dataIndex: 'discountValue',
            key: 'discountValue',
            render: (value) => (
                <span className="text-[#0d584d] font-bold">
                    {value}% OFF
                </span>
            ),
        },
        {
            title: 'Discount Condition',
            key: 'condition',
            render: (_, record) => (
                <div className="text-sm">
                    <div>Min booking amount: {record.minBookingAmount}</div>
                    <div>Max discount amount: {record.maxDiscountAmount}</div>
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            filters: [
                { text: 'Can Use', value: 'can_use' },
                { text: 'Is Used', value: 'is_used' },
                { text: 'Expired', value: 'expired' },
            ],
            onFilter: (value, record) => {
                const now = dayjs();
                const isExpired = dayjs(record.endDate).isBefore(now);

                if (value === 'can_use') return !record.isUsed && !isExpired;
                if (value === 'is_used') return record.isUsed;
                if (value === 'expired') return isExpired && !record.isUsed;
                return true;
            },
            render: (_, record) => {
                const now = dayjs();
                const isExpired = dayjs(record.endDate).isBefore(now);
                const isUsed = record.isUsed;

                if (isUsed) {
                    return (
                        <Tag icon={<CheckCircleOutlined />} color="green">
                            Is Used
                        </Tag>
                    );
                }

                if (isExpired) {
                    return (
                        <Tag icon={<CloseCircleOutlined />} color="red">
                            Expired
                        </Tag>
                    );
                }

                return (
                    <Tag icon={<ClockCircleOutlined />} color="blue">
                        Can Use
                    </Tag>
                );
            },
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mt-2">
            <Title level={4} className="mb-6">Your Vouchers</Title>
            <Table
                columns={columns}
                dataSource={listVoucher}
                rowKey="id"
                pagination={{
                    pageSize: 5,
                    showSizeChanger: false,
                }}
                locale={{
                    emptyText: (
                        <div className="py-8 text-center">
                            <div className="text-gray-400 mb-2">You don't have any vouchers</div>
                            <Link
                                to="/voucher"
                                className="text-[#0d584d] hover:underline"
                            >
                                Discover vouchers now
                            </Link>
                        </div>
                    )
                }}
            />
        </div>
    );
};

export default VoucherUser;