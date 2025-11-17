import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, DatePicker, Switch, Table, Tag, Space, Tooltip } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import useFetch from '../../hooks/fetch.hook';
import apis from '../../apis/index';
import { toast } from 'react-toastify';

const VoucherManagement = () => {
    const [isOpenCreateVoucherModal, setIsOpenCreateVoucherModal] = useState(false);
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [tiers, setTiers] = useState([]);
    const [loadingTiers, setLoadingTiers] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isOpenEditVoucherModal, setIsOpenEditVoucherModal] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);

    const [vouchers, setVouchers] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        fetchVouchers();
    }, [pagination.current, pagination.pageSize]);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const { current, pageSize } = pagination;
            const response = await apis.voucher.getVouchersForAdmin({
                page: current,
                limit: pageSize
            });

            if (response.data) {
                setVouchers(response.data.data[0]);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.data[1] || 0
                }));
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            toast.error('Failed to load vouchers');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    // CHƯA FIXX XONG
    const handleToggleStatus = async (voucherId, isActive) => {
        try {
            const newStatus = isActive ? 0 : 1;
            await apis.voucher.toggleVoucherStatus(voucherId, newStatus);
            toast.success(`Voucher ${isActive ? 'unpublished' : 'published'} successfully`);
            fetchVouchers(); // Refresh the list
        } catch (error) {
            console.error('Error toggling voucher status:', error);
            toast.error(error.response?.data?.message || 'Failed to update voucher status');
        }
    };

    const handleSubmitEdit = async () => {
        try {
            const values = await formEdit.validateFields();
            setLoading(true);

            const voucherData = {
                claimLimit: parseInt(values.claim_limit, 10),
                // userTierIds: values.userTierIds
            };

            await apis.voucher.updateVoucher(editingVoucher.id, voucherData);
            toast.success('Voucher updated successfully!');
            handleCancelEdit();
            fetchVouchers();
        } catch (error) {
            console.error('Error updating voucher:', error);
            toast.error(error.response?.data?.message || 'Failed to update voucher');
        } finally {
            setLoading(false);
        }
    };
    const handleCancelEdit = () => {
        setIsOpenEditVoucherModal(false);
        form.resetFields();
        setEditingVoucher(null);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-medium">{text}</span>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: {
                showTitle: false,
            },
            render: (description) => (
                <Tooltip placement="topLeft" title={description}>
                    <span className="text-gray-600">{description}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Discount',
            key: 'discount',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.discountValue}% off</div>
                    <div className="text-xs text-gray-500">
                        Max: ${record.maxDiscountAmount}
                    </div>
                </div>
            ),
        },
        {
            title: 'Min. Booking',
            key: 'minBooking',
            render: (_, record) => `$${record.minBookingAmount}`,
        },
        {
            title: 'Valid Date',
            key: 'date',
            width: 200,
            render: (_, record) => (
                <div>
                    <div>From: {new Date(record.startDate).toLocaleString()}</div>
                    <div>To: {new Date(record.endDate).toLocaleString()}</div>
                </div>
            ),
        },
        {
            title: 'Claim Limit',
            dataIndex: 'claimLimit',
            key: 'claimLimit',
            align: 'center',
        },
        {
            title: 'User Tiers',
            key: 'tiers',
            render: (_, record) => (
                <Tooltip
                    title={record.userTiers?.map(tier => tier.tierName).join(', ')}
                    placement="topLeft"
                >
                    <div className="max-w-[150px] truncate">
                        {record.userTiers?.map(tier => tier.tierName).join(', ')}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            width: 100,
            render: (_, record) => (
                <Tag color={record.isActive ? 'green' : 'red'} className="capitalize">
                    {record.isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
                        <Switch
                            checked={record.isActive}
                            onChange={(checked) => handleToggleStatus(record.id, checked)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                                // Set all form fields with the current voucher data
                                formEdit.setFieldsValue({
                                    claim_limit: record.claimLimit,
                                    // userTierIds: record.userTiers?.map(tier => tier.id) || []  // Make sure this is an array of tier IDs
                                });
                                setEditingVoucher(record);
                                setIsOpenEditVoucherModal(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteVoucher(record.id)}
                            loading={loading}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleDeleteVoucher = async (id) => {
        try {
            setLoading(true);
            await apis.voucher.deleteVoucher(id);
            toast.success('Voucher deleted successfully');
            fetchVouchers(); // Refresh the vouchers list
        } catch (error) {
            console.error('Error deleting voucher:', error);
            toast.error(error.response?.data?.message || 'Failed to delete voucher');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const fetchTiers = async () => {
            if (isOpenCreateVoucherModal) {
                try {
                    setLoadingTiers(true);
                    const response = await apis.user.getUserTiers({ limit: 100 });

                    // Update this line to handle the nested data structure
                    if (response?.data?.data?.[0] && Array.isArray(response.data.data[0])) {
                        setTiers(response.data.data[0]);
                    }
                } catch (error) {
                    console.error('Error fetching tiers:', error);
                    toast.error('Failed to load user tiers');
                } finally {
                    setLoadingTiers(false);
                }
            }
        };

        fetchTiers();
    }, [isOpenCreateVoucherModal]);
    // useEffect(() => {
    //     const fetchTiers = async () => {
    //         if (isOpenEditVoucherModal) {
    //             try {
    //                 setLoadingTiers(true);
    //                 const response = await apis.user.getUserTiers({ limit: 100 });

    //                 // Update this line to handle the nested data structure
    //                 if (response?.data?.data?.[0] && Array.isArray(response.data.data[0])) {
    //                     setTiers(response.data.data[0]);
    //                 }
    //             } catch (error) {
    //                 console.error('Error fetching tiers:', error);
    //                 toast.error('Failed to load user tiers');
    //             } finally {
    //                 setLoadingTiers(false);
    //             }
    //         }
    //     };

    //     fetchTiers();
    // }, [isOpenEditVoucherModal]);
    const handleOpenCreate = () => {
        setIsOpenCreateVoucherModal(true);
    };

    const handleCancelCreate = () => {
        setIsOpenCreateVoucherModal(false);
        form.resetFields();
    };

    const handleSubmitCreate = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Format data to match API schema
            const voucherData = {
                name: values.name,
                description: values.description || null,
                discountType: values.discount_type, // Match API's camelCase
                discountValue: parseFloat(values.discount_value).toFixed(2),
                maxDiscountAmount: values.max_discount_amount ? parseFloat(values.max_discount_amount).toFixed(2) : null,
                startDate: values.start_date.format('YYYY-MM-DDTHH:mm:ss[Z]'),
                endDate: values.end_date.format('YYYY-MM-DDTHH:mm:ss[Z]'),
                claimLimit: parseInt(values.claim_limit, 10), // Changed to claimLimit and ensure it's an integer
                minBookingAmount: values.min_booking_amount ? parseFloat(values.min_booking_amount).toFixed(2) : '0.00',
                // isActive: values.is_active !== undefined ? values.is_active : true, // Default to true if not set
                userTierIds: values.userTierIds
            };

            const response = await apis.voucher.createVoucher(voucherData);
            toast.success('Voucher created successfully!');
            handleCancelCreate();
            // TODO: Refresh voucher list if needed
        } catch (error) {
            console.error('Error creating voucher:', error);
            toast.error(error.response?.data?.message || 'Failed to create voucher');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
            >
                Create Voucher
            </Button>

            <Table
                columns={columns}
                dataSource={vouchers}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `Total ${total} vouchers`
                }}
                loading={loading}
                onChange={handleTableChange}
            />

            <Modal
                title="Create Voucher"
                open={isOpenCreateVoucherModal}
                onCancel={handleCancelCreate}
                onOk={handleSubmitCreate}
                okText="Create"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter voucher name' }]}
                    >
                        <Input placeholder="Voucher name" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea rows={3} placeholder="Description" />
                    </Form.Item>

                    <div className="flex gap-4">
                        <Form.Item
                            label="Discount Type"
                            name="discount_type"
                            rules={[{ required: true, message: 'Select discount type' }]}
                            style={{ flex: 1 }}
                        >
                            <Select placeholder="Select type">
                                <Select.Option value="percentage">Percentage (%)</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Discount Value"
                            name="discount_value"
                            rules={[{ required: true, message: 'Enter discount value' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>

                    <div className="flex gap-4">
                        <Form.Item
                            label="Max Discount Amount"
                            name="max_discount_amount"
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Min Booking Amount"
                            name="min_booking_amount"
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>

                    <div className="flex gap-4">
                        <Form.Item
                            label="Start Date"
                            name="start_date"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Select start date' }]}
                        >
                            <DatePicker showTime className="w-full" />
                        </Form.Item>

                        <Form.Item
                            label="End Date"
                            name="end_date"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Select end date' }]}
                        >
                            <DatePicker showTime className="w-full" />
                        </Form.Item>
                    </div>

                    <div className="flex gap-4 items-center">
                        <Form.Item
                            label="Claim Limit"
                            name="claim_limit"
                            style={{ flex: 1 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Claim limit is required'
                                },
                                {
                                    type: 'number',
                                    min: 1,
                                    message: 'Claim limit must be at least 1'
                                }
                            ]}
                        >
                            <InputNumber
                                min={1}
                                style={{ width: '100%' }}
                                precision={0} // Ensures only whole numbers
                            />
                        </Form.Item>
                        <Form.Item
                            label="Applicable User Tiers"
                            name="userTierIds"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Please select at least one user tier' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select user tiers"
                                loading={loadingTiers}
                                optionLabelProp="label"
                            >
                                {tiers.map(tier => (
                                    <Select.Option
                                        key={tier.id}
                                        value={tier.id}
                                        label={tier.tierName}
                                    >
                                        {tier.tierName} ({tier.tierSlug})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            <Modal
                title="Edit Voucher"
                open={isOpenEditVoucherModal}
                onCancel={handleCancelEdit}
                onOk={handleSubmitEdit}
                okText="Update"
            >
                <Form layout="vertical"
                    form={formEdit}
                    initialValues={{
                        claim_limit: 0,
                    }}>
                    <div className="flex gap-4 items-center">
                        <Form.Item
                            label="Claim Limit"
                            name="claim_limit"
                            style={{ flex: 1 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Claim limit is required'
                                },
                                {
                                    type: 'number',
                                    min: 1,
                                    message: 'Claim limit must be at least 1'
                                }
                            ]}
                        >
                            <InputNumber
                                min={1}
                                style={{ width: '100%' }}
                                precision={0}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>


        </div>
    );
};

export default VoucherManagement;