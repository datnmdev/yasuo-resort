import React, { useState } from 'react';
import { Table, Tag, Button, Space, Form, Input, DatePicker, message, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apis from '@apis/index';

const ContractServices = ({ data, dataCombo }) => {

    console.log("kiểm tra data và datacombo", data, dataCombo)

    const [editingKey, setEditingKey] = useState('');
    const [form] = Form.useForm();

    const isEditing = (record) => record.id === editingKey;

    const edit = (record) => {
        form.setFieldsValue({
            quantity: record.quantity,
            startDate: dayjs(record.startDate),
            endDate: dayjs(record.endDate),
        });
        setEditingKey(record.id);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const validateQuantity = (_, value) => {
        if (!value) {
            return Promise.reject('Vui lòng nhập số lượng!');
        }
        if (value > dataCombo?.capacity) {
            return Promise.reject(`Số lượng không được vượt quá ${dataCombo?.capacity} người`);
        }
        return Promise.resolve();
    };

    const validateStartDate = (_, value) => {
        if (!value) {
            return Promise.reject('Vui lòng chọn ngày bắt đầu!');
        }
        const bookingStartDate = dayjs(dataCombo?.startDate);
        if (value.isBefore(bookingStartDate, 'day')) {
            return Promise.reject(`Ngày bắt đầu không được nhỏ hơn ${bookingStartDate.format('DD/MM/YYYY')}`);
        }
        return Promise.resolve();
    };

    const validateEndDate = (_, value) => {
        if (!value) {
            return Promise.reject('Vui lòng chọn ngày kết thúc!');
        }
        const bookingEndDate = dayjs(dataCombo?.endDate);
        if (value.isAfter(bookingEndDate, 'day')) {
            return Promise.reject(`Ngày kết thúc không được lớn hơn ${bookingEndDate.format('DD/MM/YYYY')}`);
        }
        return Promise.resolve();
    };

    const save = async (id) => {
        try {
            const values = await form.validateFields();
            const payload = {
                quantity: parseInt(values.quantity, 10),
                startDate: values.startDate.format('YYYY-MM-DD'),
                endDate: values.endDate.format('YYYY-MM-DD')
            };

            // Find the service to get its ID
            const service = data.find(item => item.id === id);
            if (!service) {
                throw new Error('Service not found');
            }

            // Call the API to update the service
            const response = await apis.service.updateBookedService(
                { serviceId: service.id },
                payload
            );

            // Update the local state with the updated data
            const newData = data.map(item =>
                item.id === id ? {
                    ...item,
                    ...payload
                } : item
            );

            message.success('Cập nhật dịch vụ thành công');
            setEditingKey('');
            window.location.reload()
        } catch (error) {
            console.error('Error updating service:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dịch vụ');
        }
    };

    const handleCancelService = async (record) => {
        try {
            await apis.service.cancelBookedService({ serviceId: record.id });
            message.success('Đã hủy dịch vụ thành công');
            // Optionally refresh the data or update the UI
            window.location.reload()
        } catch (error) {
            console.error('Error cancelling service:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy dịch vụ');
        }
    };


    const columns = [
        {
            title: "Service Name",
            dataIndex: "service",
            key: "serviceName",
            render: (service) => service?.name || 'N/A',
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `$${price}`,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Form.Item
                        name="quantity"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số lượng!' },
                            { validator: validateQuantity }
                        ]}
                        style={{ margin: 0 }}
                    >
                        <Input type="number" min={1} max={dataCombo?.capacity} />
                    </Form.Item>
                ) : (
                    record.quantity
                );
            },
        },
        {
            title: "Start Date",
            dataIndex: "startDate",
            key: "startDate",
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Form.Item
                        name="startDate"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngày bắt đầu!' },
                            { validator: validateStartDate }
                        ]}
                        style={{ margin: 0 }}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => {
                                const bookingEndDate = dayjs(dataCombo?.endDate);
                                return current && (
                                    current.isBefore(dayjs(dataCombo?.startDate), 'day') ||
                                    current.isAfter(bookingEndDate, 'day')
                                );
                            }}
                        />
                    </Form.Item>
                ) : (
                    record.startDate
                );
            },
        },
        {
            title: "End Date",
            dataIndex: "endDate",
            key: "endDate",
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Form.Item
                        name="endDate"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                            { validator: validateEndDate },
                        ]}
                        style={{ margin: 0 }}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => {
                                const bookingStartDate = dayjs(dataCombo?.startDate);
                                return current && (
                                    current.isBefore(bookingStartDate, 'day') ||
                                    current.isAfter(dayjs(dataCombo?.endDate), 'day')
                                );
                            }}
                        />
                    </Form.Item>
                ) : (
                    record.endDate
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status, record) => {
                let tagColor = 'green';
                if (status === 'pending') tagColor = 'orange';
                if (status === 'rejected') tagColor = 'red';

                return (
                    <Tooltip
                        title={status === 'rejected' && record.reasonForRejection
                            ? <div dangerouslySetInnerHTML={{ __html: record.reasonForRejection }} />
                            : null
                        }
                        overlayClassName="max-w-md"
                    >
                        <Tag color={tagColor} className="cursor-help">
                            {status.toUpperCase()}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => {
                const isEditable = !['confirmed', 'rejected', 'cancelled'].includes(record.status);
                const editable = isEditing(record);

                return (
                    <Space size="middle">
                        {editable ? (
                            <>
                                <Button
                                    type="text"
                                    icon={<SaveOutlined />}
                                    onClick={() => save(record.id)}
                                />
                                <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    onClick={cancel}
                                />
                            </>
                        ) : (
                            <>
                                {isEditable && (
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => edit(record)}
                                    />
                                )}
                                {isEditable && (
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleCancelService(record)}
                                    />
                                )}
                            </>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="mt-4">
            <Form form={form} component={false}>
                <Table
                    columns={columns}
                    dataSource={data || []}
                    rowKey="id"
                    pagination={false}
                    bordered
                />
            </Form>
        </div>
    );
};

export default ContractServices;