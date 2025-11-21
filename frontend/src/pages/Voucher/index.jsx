import React, { useState, useMemo } from 'react';
import useFetch from '../../hooks/fetch.hook';
import apis from '../../apis/index';
import { toast } from 'react-toastify';
import { Button, Modal, Tag, Typography, Card, Alert } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
    InfoCircleOutlined,
    GiftOutlined,
    CalendarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Voucher = () => {
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    // Get user info
    const { data: userTier } = useFetch(() => apis.user.getProfile());
    const { data: vouchersData, loading, refetch } = useFetch(
        () => apis.voucher.getVouchersForAll({ page: 1, limit: 10 })
    );

    const { filteredVouchers } = useMemo(() => {
        if (!vouchersData?.data?.[0]) return { filteredVouchers: [] };

        const allVouchers = vouchersData.data[0].map(voucher => {
            const canClaim = userTier &&
                (!voucher.userTiers?.length ||
                    voucher.userTiers.some(t => t.tierSlug === userTier.data?.userTier?.tierSlug));

            return { ...voucher, canClaim };
        });

        return { filteredVouchers: allVouchers };
    }, [vouchersData, userTier]);

    const handleViewDetails = (voucher) => {
        setSelectedVoucher(voucher);
        setIsModalVisible(true);
    };

    const handleClaimVoucher = async (voucherId) => {
        try {
            if (!userTier) {
                toast.error('Please log in to claim vouchers.');
                return;
            }

            setIsClaiming(true);
            const response = await apis.voucher.claimVoucher({
                id: parseInt(voucherId)
            });

            if (response.data) {
                toast.success('Voucher claimed successfully!');
                refetch();
            }
        } catch (error) {
            console.log("check error", error)
            toast.error(error.response?.data?.error?.message || 'An error occurred while claiming the voucher');
        } finally {
            setIsClaiming(false);
        }
    };

    const VoucherCard = ({ voucher }) => {
        const canClaim = userTier &&
            (!voucher.userTiers?.length ||
                voucher.userTiers.some(t => t.tierSlug === userTier.data?.userTier?.tierSlug));

        return (
            <motion.div variants={item} className="w-full h-full">
                <Card
                    className="h-full"
                    bodyStyle={{ padding: 0 }}
                    style={{ borderRadius: '12px', overflow: 'hidden' }}
                >
                    {/* Header */}
                    <div className="relative bg-[#00988B] p-4 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-3xl font-bold">{voucher.discountValue}%</div>
                                <div className="text-sm opacity-90">DISCOUNT</div>
                            </div>
                            <div className="text-right">
                            </div>
                        </div>
                        <Tag
                            color="#00988B"
                            className="absolute top-2 right-2 font-medium"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            ACTIVE
                        </Tag>
                    </div>

                    {/* Voucher details */}
                    <div className="p-4">
                        <Typography.Title level={5} className="m-0 mb-3">
                            {voucher.name}
                        </Typography.Title>

                        <div className="flex items-center text-sm text-gray-600 mb-4">
                            <CalendarOutlined className="mr-2" />
                            <span>Valid until: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-gray-50 p-2 rounded">
                                <div className="text-xs text-gray-500">Minimum Order</div>
                                <div className="font-medium">${voucher.minBookingAmount}</div>
                            </div>

                            {voucher.maxDiscountAmount && (
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">Maximum Discount</div>
                                    <div className="font-medium">${voucher.maxDiscountAmount}</div>
                                </div>
                            )}
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            icon={<GiftOutlined />}
                            onClick={() => handleClaimVoucher(voucher.id)}
                            loading={isClaiming}
                            disabled={!canClaim}
                            block
                            className="h-11 font-medium"
                            style={{ backgroundColor: "#00988B", borderColor: "#00988B" }}
                        >
                            {!userTier
                                ? 'Login to claim'
                                : !canClaim
                                    ? 'Not eligible'
                                    : 'Claim now'}
                        </Button>

                        <Button
                            type="text"
                            icon={<InfoCircleOutlined />}
                            onClick={() => handleViewDetails(voucher)}
                            block
                            className="mt-2"
                        >
                            View details
                        </Button>
                    </div>
                </Card>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <Title level={2} className="text-3xl font-bold text-gray-800 mb-2">
                        Exclusive Vouchers
                    </Title>
                    <Text type="secondary" className="text-lg">
                        Claim your special offers and save on your next booking
                    </Text>
                </div>

                {!userTier && (
                    <Alert
                        message="Login to claim vouchers"
                        description="Sign in to unlock exclusive discounts and special offers!"
                        type="info"
                        showIcon
                        className="mb-8 max-w-2xl mx-auto"
                    />
                )}

                {userTier?.data?.userTier && (
                    <div className="text-center mb-6">
                        <Tag color="#00988B" className="text-base px-4 py-1.5 font-medium">
                            Your Tier: {userTier.data.userTier.tierName}
                        </Tag>
                    </div>
                )}

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 w-full"
                >
                    <AnimatePresence>
                        {filteredVouchers.map(voucher => (
                            <>
                                <VoucherCard key={voucher.id} voucher={voucher} />
                            </>

                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Voucher Detail Modal */}
            <Modal
                title="Voucher Details"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedVoucher && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-[#00988B0D] to-[#00988B1A] p-6 rounded-lg mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                        {selectedVoucher.name}
                                    </h3>
                                    <div className="text-4xl font-bold text-[#00988B] mb-2">
                                        {selectedVoucher.discountValue}% OFF
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Valid until: {new Date(selectedVoucher.endDate).toLocaleDateString()}
                                    </div>
                                </div>

                                <Tag color="#00988B" className="text-sm font-medium h-6">
                                    ACTIVE
                                </Tag>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-gray-700">
                                    {selectedVoucher.description || 'No description available.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">Minimum Order</div>
                                    <div className="font-medium">
                                        ${selectedVoucher.minBookingAmount}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">Maximum Discount</div>
                                    <div className="font-medium">
                                        {selectedVoucher.maxDiscountAmount
                                            ? `$${selectedVoucher.maxDiscountAmount}`
                                            : 'No limit'}
                                    </div>
                                </div>
                            </div>

                            {selectedVoucher.userTiers?.length > 0 && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold mb-2">Eligible Tiers</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedVoucher.userTiers.map(tier => (
                                            <Tag key={tier.id} color="#00988B">
                                                {tier.tierName}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-200">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<GiftOutlined />}
                                    style={{ backgroundColor: "#00988B", borderColor: "#00988B" }}
                                    onClick={() => {
                                        handleClaimVoucher(selectedVoucher.id);
                                        setIsModalVisible(false);
                                    }}
                                    loading={isClaiming}
                                    disabled={!selectedVoucher.canClaim}
                                    block
                                    className="h-12 text-base"
                                >
                                    {!userTier
                                        ? 'Login to claim'
                                        : !selectedVoucher.canClaim
                                            ? 'Not eligible'
                                            : 'Claim this voucher'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Voucher;
