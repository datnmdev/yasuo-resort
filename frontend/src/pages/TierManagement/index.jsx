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
import { formatCurrencyUSD } from '../../libs/utils';

const TierManagement = () => {

    const [isOpenTierModal, setIsOpenTierModal] = useState(false);
    const [isEditTierModal, setIsEditTierModal] = useState(false);
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tiers, setTiers] = useState([]);
    const [editingTier, setEditingTier] = useState(null);


    const columns = [
        {
            title: 'Tier Name',
            dataIndex: 'tierName',
            key: 'tierName',
        },
        {
            title: 'Tier Slug',
            dataIndex: 'tierSlug',
            key: 'tierSlug',
        },
        {
            title: 'Min Spending',
            dataIndex: 'minSpending',
            key: 'minSpending',
            render: (value) => `$${parseFloat(value).toFixed(2)}`
        },
        {
            title: 'Min Bookings',
            dataIndex: 'minBookings',
            key: 'minBookings',
        },
        {
            title: 'Duration (Months)',
            dataIndex: 'durationMonths',
            key: 'durationMonths',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true, // This will show "..." if the text is too long
            render: (text) => text || '-', // Show '-' if description is empty
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingTier(record);
                            formEdit.setFieldsValue({
                                tierName: record.tierName,
                                tierSlug: record.tierSlug,
                                tierOrder: record.tierOrder,
                                minSpending: parseFloat(record.minSpending),
                                minBookings: record.minBookings,
                                durationMonths: record.durationMonths,
                                description: record.description
                            });
                            setIsEditTierModal(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteTier(record.id)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Add this handler for table pagination
    const handleTableChange = (pagination, filters, sorter) => {
        fetchTiers(pagination.current, pagination.pageSize);
    };

    const handleCreateTier = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            // Format the data to match backend expectations
            const tierData = {
                tierName: values.tierName,
                tierSlug: values.tierSlug,
                tierOrder: Number(values.tierOrder),
                minSpending: Number(values.minSpending).toFixed(2), // Convert to string with 2 decimal places
                minBookings: Number(values.minBookings),
                durationMonths: Number(values.durationMonths),
                description: values.description
            };

            await apis.user.createTier(tierData);
            toast.success('Tier created successfully!');
            handleCancelTierModalCreate();
            fetchTiers();
        } catch (error) {
            console.error('Error creating tier:', error);
            toast.error(error.response?.data?.message || 'Failed to create tier');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelTierModalCreate = () => {
        setIsOpenTierModal(false);
        form.resetFields();
    };

    const handleCancelEditTierModal = () => {
        setIsEditTierModal(false);
        formEdit.resetFields();
    };

    const handleEditTier = async () => {
        try {
            setLoading(true);
            const values = await formEdit.validateFields();
            // Format the data to match backend expectations
            const tierData = {
                tierName: values.tierName,
                tierSlug: values.tierSlug,
                tierOrder: Number(values.tierOrder),
                minSpending: Number(values.minSpending).toFixed(2),
                minBookings: Number(values.minBookings),
                durationMonths: Number(values.durationMonths),
                description: values.description
            };

            await apis.user.updateTier(editingTier.id, tierData);
            toast.success('Tier updated successfully!');
            handleCancelEditTierModal();
            fetchTiers();
        } catch (error) {
            console.error('Error updating tier:', error);
            toast.error(error.response?.data?.message || 'Failed to update tier');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTier = async (id) => {
        try {
            setLoading(true);
            await apis.user.deleteTier(id);
            toast.success('Tier deleted successfully');
            fetchTiers(); // Refresh the tiers list
        } catch (error) {
            console.error('Error deleting tier:', error);
            toast.error(error.response?.data?.message || 'Failed to delete tier');
        } finally {
            setLoading(false);
        }
    };

    const fetchTiers = async () => {
        try {
            setLoading(true);
            const response = await apis.user.getUserTiers();
            if (response.data) {
                setTiers(response.data.data[0]);
            }
        } catch (error) {
            console.error('Error fetching tiers:', error);
            toast.error('Failed to load tiers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    return (
        <div className="p-4">
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsOpenTierModal(true)}
            >
                Create Tier
            </Button>

            <Table
                columns={columns}
                dataSource={tiers}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />

            <Modal
                title="Create Tier"
                open={isOpenTierModal}
                onOk={handleCreateTier}
                onCancel={handleCancelTierModalCreate}
                okText="Create"
                cancelText="Cancel"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateTier}
                >
                    <Form.Item
                        name="tierName"
                        label="Tier Name"
                        rules={[{ required: true, message: 'Please input tier name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="tierSlug"
                        label="Tier Slug"
                        rules={[{ required: true, message: 'Please input tier slug!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Tier Order"
                        name="tierOrder"
                        rules={[
                            { required: true, message: 'Please input tier order!' },
                            { type: 'number', message: 'Tier order must be a number' }
                        ]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Minimum Spending (USD)"
                        name="minSpending"
                        rules={[
                            { required: true, message: 'Please input minimum spending!' },
                            {
                                validator: (_, value) => {
                                    if (isNaN(Number(value)) || Number(value) <= 0) {
                                        return Promise.reject('Please enter a valid amount greater than 0');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <InputNumber
                            min={0}
                            step={0.01}
                            precision={2}
                            formatter={(value) => {
                                const num = Number(value || 0);
                                return isNaN(num) ? '' : num.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }}
                            parser={(value) => {
                                // Remove all non-numeric characters except decimal point
                                const parsed = value.replace(/[^0-9.]/g, '');
                                // Ensure only one decimal point
                                const parts = parsed.split('.');
                                if (parts.length > 2) {
                                    return parts[0] + '.' + parts.slice(1).join('');
                                }
                                return parsed;
                            }}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Minimum Bookings"
                        name="minBookings"
                        rules={[
                            { required: true, message: 'Please input minimum bookings!' },
                            { type: 'number', message: 'Must be a number' }
                        ]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Duration (Months)"
                        name="durationMonths"
                        rules={[
                            { required: true, message: 'Please input duration in months!' },
                            { type: 'number', message: 'Must be a number' }
                        ]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please input description!' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter tier description" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Edit Tier"
                open={isEditTierModal}
                onOk={handleEditTier}
                onCancel={handleCancelEditTierModal}
                okText="Edit"
                cancelText="Cancel"
            >
                <Form
                    form={formEdit}
                    layout="vertical"
                    onFinish={handleEditTier}
                >
                    <Form.Item
                        name="tierName"
                        label="Tier Name"
                        rules={[{ required: true, message: 'Please input tier name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="tierSlug"
                        label="Tier Slug"
                        rules={[{ required: true, message: 'Please input tier slug!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Tier Order"
                        name="tierOrder"
                        rules={[
                            { required: true, message: 'Please input tier order!' },
                            { type: 'number', message: 'Tier order must be a number' }
                        ]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Minimum Spending (USD)"
                        name="minSpending"
                        rules={[
                            { required: true, message: 'Please input minimum spending!' },
                            {
                                validator: (_, value) => {
                                    if (isNaN(Number(value)) || Number(value) <= 0) {
                                        return Promise.reject('Please enter a valid amount greater than 0');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <InputNumber
                            min={0}
                            step={0.01}
                            precision={2}
                            formatter={(value) => {
                                const num = Number(value || 0);
                                return isNaN(num) ? '' : num.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            }}
                            parser={(value) => {
                                // Remove all non-numeric characters except decimal point
                                const parsed = value.replace(/[^0-9.]/g, '');
                                // Ensure only one decimal point
                                const parts = parsed.split('.');
                                if (parts.length > 2) {
                                    return parts[0] + '.' + parts.slice(1).join('');
                                }
                                return parsed;
                            }}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Minimum Bookings"
                        name="minBookings"
                        rules={[
                            { required: true, message: 'Please input minimum bookings!' },
                            { type: 'number', message: 'Must be a number' }
                        ]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Duration (Months)"
                        name="durationMonths"
                        rules={[
                            { required: true, message: 'Please input duration in months!' },
                            { type: 'number', message: 'Must be a number' }
                        ]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please input description!' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter tier description" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default TierManagement