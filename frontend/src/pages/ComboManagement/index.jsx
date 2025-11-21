import React, { useState, useEffect } from 'react';
import { PlusOutlined, CheckCircleOutlined, EditOutlined, DeleteOutlined, GlobalOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Modal, Tag, Card, Badge, Pagination, Image, message, Form, Input, InputNumber, Table, Space, Tooltip } from 'antd';
import useFetch from '../../hooks/fetch.hook';
import apis from '../../apis/index';
import { toast } from 'react-toastify';

const RoomCard = ({ room, isSelected, onSelect, baseUrl }) => (
    <Card
        hoverable
        className="h-full cursor-pointer"
        onClick={() => onSelect(room)}
        style={{
            border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
            background: isSelected ? '#f6f8fb' : 'white',
        }}
    >
        <Badge
            count={isSelected ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : null}
            style={{ backgroundColor: 'transparent' }}
        >
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <Tag color={'green'}>{room.name}</Tag>
                        <p className="text-sm text-gray-600 mt-1">Min price: <Tag color={'green'}>{room.minPrice}</Tag></p>
                        <p className="text-sm text-gray-600 mt-1">Max price: <Tag color={'green'}>{room.maxPrice}</Tag></p>
                    </div>
                </div>
                <div className="flex justify-between text-sm">

                </div>
            </div>
        </Badge>
    </Card>
);

const ServiceCard = ({ service, isSelected, onSelect }) => (
    <Card
        hoverable
        className="h-full cursor-pointer"
        onClick={() => onSelect(service)}
        style={{
            border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
            background: isSelected ? '#f6f8fb' : 'white',
        }}
    >
        <Badge
            count={isSelected ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : null}
            style={{ backgroundColor: 'transparent' }}
        >
            <div className="flex flex-col gap-3">
                <h4 className="font-semibold line-clamp-2">{service.name}</h4>
                <Tag color={service.status === 'active' ? 'green' : 'red'} className="mt-1">
                    {service.status?.toUpperCase()}
                </Tag>
                <p className="text-sm text-gray-600 line-clamp-3" dangerouslySetInnerHTML={{ __html: service.description }} />
                <div className="flex justify-end">
                    <span className="font-bold text-teal-600">${service.price}</span>
                </div>
            </div>
        </Badge>
    </Card>
);

const ComboManagement = () => {
    // 1. STATE MANAGEMENT
    const [isOpenCreateComboModal, setIsOpenCreateComboModal] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roomPage, setRoomPage] = useState(1);
    const [servicePage, setServicePage] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [tableData, setTableData] = useState([[], 0]);
    const [getComboReq, setComboReq] = useState({
        page: 1,
        limit: 10,
    });

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const limit = 3; // Limit for room/service cards pagination
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    // 2. FETCH DATA HOOKS
    // Fetch all rooms and services (for combo creation modal)
    const { data: roomsData } = useFetch(() => apis.roomType.getRoomTypes({ page: 1, limit: 9999 }), []);
    const { data: servicesData } = useFetch(() => apis.service.getServices({ page: 1, limit: 9999 }), []);
    const {
        data: combos,
        isLoading: isGettingCombo,
        setRefetch: setReGetCombo,
    } = useFetch(apis.booking.getComboForAdmin, getComboReq);

    const roomList = roomsData?.data?.[0] || [];
    const serviceList = servicesData?.data?.[0] || [];

    // 3. EFFECT HOOKS (Handle API response for Combos)
    useEffect(() => {
        if (!isGettingCombo && combos && combos.isSuccess) {
            setTableData([
                combos.data[0].map((combo) => ({
                    key: combo.id,
                    id: combo.id,
                    name: combo.name,
                    isActive: combo.isActive,
                    discountValue: combo.discountValue,
                    maxDiscountAmount: combo.maxDiscountAmount,
                    minStayNights: combo.minStayNights,
                    roomType: combo.roomType?.name || '-',
                    minPrice: combo.minPrice,
                    maxPrice: combo.maxPrice,
                    description: combo.description,
                    createdAt: combo.createdAt,
                })),
                combos.data[1] || 0
            ]);
        }
    }, [combos, isGettingCombo]);

    // 4. HANDLERS
    const handleSelectRoom = (room) => {
        // Chỉ cho phép chọn 1 phòng (hoặc loại phòng)
        setSelectedRooms(selectedRooms.find(r => r.id === room.id) ? [] : [room]);
    };

    const handleSelectService = (service) => {
        // Cho phép chọn nhiều dịch vụ
        setSelectedServices(prev => {
            if (prev.find(s => s.id === service.id)) return prev.filter(s => s.id !== service.id);
            return [...prev, service];
        });
    };

    const handleCreateCombo = async () => {
        if (selectedRooms.length === 0) {
            toast.warning("Please select a room type");
            return;
        }
        if (selectedServices.length === 0) {
            toast.warning("Please select at least one service for the combo");
            return;
        }
        setLoading(true);
        try {
            const values = await form.validateFields();
            const payload = {
                roomTypeId: selectedRooms[0].id,
                name: values.name,
                description: values.description,
                discountValue: values.discountValue,
                // Chú ý: .toFixed(2) chuyển thành string, nên cần đảm bảo API server xử lý đúng
                maxDiscountAmount: parseFloat(values.maxDiscountAmount).toFixed(2),
                minStayNights: values.minStayNights,
                serviceIds: selectedServices.map(s => s.id),
            };
            await apis.booking.createCombo(payload);
            toast.success("Create combo successfully!");
            setIsOpenCreateComboModal(false);
            setSelectedRooms([]);
            setSelectedServices([]);
            form.resetFields();
            setComboReq(prev => ({ ...prev, _t: Date.now() })); // Trigger re-fetch combo list
        } catch (err) {
            console.error(err);
            message.error("Create combo failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingCombo(record);
        editForm.setFieldsValue({
            name: record.name,
            description: record.description,
            discountValue: record.discountValue,
            maxDiscountAmount: record.maxDiscountAmount,
            minStayNights: record.minStayNights,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateCombo = async () => {
        try {
            const values = await editForm.validateFields();
            await apis.booking.updateCombo(editingCombo.id, values);
            toast.success('Combo updated successfully!');
            setIsEditModalOpen(false);
            setComboReq(prev => ({ ...prev, _t: Date.now() })); // Trigger re-fetch
        } catch (error) {
            console.error('Error updating combo:', error);
            toast.error('Failed to update combo');
        }
    };

    const handleTogglePublication = async (record) => {
        try {
            // Giá trị 1 là active (Publish), 0 là inactive (Unpublish)
            const newStatus = record.isActive ? 0 : 1;
            await apis.booking.toggleComboPublication(record.id, newStatus);
            toast.success(`Combo ${record.isActive ? 'unpublished' : 'published'} successfully!`);
            setComboReq(prev => ({ ...prev, _t: Date.now() })); // Trigger re-fetch
        } catch (error) {
            console.error('Error toggling combo publication:', error);
            toast.error(`Failed to ${record.isActive ? 'unpublish' : 'publish'} combo`);
        }
    };

    // 5. DATA FOR RENDER
    const currentRoomList = roomList.slice((roomPage - 1) * limit, roomPage * limit);
    const currentServiceList = serviceList.slice((servicePage - 1) * limit, servicePage * limit);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'status',
            render: (isActive) => {
                const color = isActive ? 'green' : 'red';
                const text = isActive ? 'ACTIVE' : 'INACTIVE';
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Discount (%)',
            dataIndex: 'discountValue',
            key: 'discountValue',
            render: (val) => `${val}%`,
        },
        {
            title: 'Max Discount',
            dataIndex: 'maxDiscountAmount',
            key: 'maxDiscountAmount',
            render: (val) => `$${val}`,
        },
        {
            title: 'Min Stay Nights',
            dataIndex: 'minStayNights',
            key: 'minStayNights',
        },
        {
            title: 'Room Type',
            dataIndex: 'roomType',
            key: 'roomType',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (htmlText) => <div dangerouslySetInnerHTML={{ __html: htmlText }}></div>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={record.isActive ? 'Unpublish' : 'Publish'}>
                        <Button
                            shape="circle"
                            icon={record.isActive ? <LockOutlined /> : <GlobalOutlined />}
                            onClick={() => handleTogglePublication(record)}
                            type={record.isActive ? 'default' : 'primary'}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // 6. RENDER
    return (
        <div className="p-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsOpenCreateComboModal(true)}>
                Create Combo
            </Button>

            <Table
                columns={columns}
                dataSource={tableData[0]}
                pagination={false}
                loading={isGettingCombo}
                rowKey="id"
                className="mt-4"
            />

            <div className="mt-4 flex justify-center">
                <Pagination
                    showQuickJumper
                    current={getComboReq.page}
                    total={tableData[1]}
                    pageSize={getComboReq.limit}
                    onChange={(page, pageSize) => {
                        setComboReq(prev => ({
                            ...prev,
                            page,
                            limit: pageSize || prev.limit
                        }));
                    }}
                    onShowSizeChange={(current, size) => {
                        setComboReq(prev => ({
                            ...prev,
                            page: 1, // Reset to first page when changing page size
                            limit: size
                        }));
                    }}
                    showSizeChanger
                    pageSizeOptions={['10', '20', '50', '100']}
                />
            </div>

            {/* Create Combo Modal */}
            <Modal
                title="Create Combo"
                open={isOpenCreateComboModal}
                onOk={handleCreateCombo}
                onCancel={() => {
                    setIsOpenCreateComboModal(false);
                    form.resetFields();
                    setSelectedRooms([]);
                    setSelectedServices([]);
                }}
                width={1200}
                confirmLoading={loading}
                footer={[
                    <Button key="back" onClick={() => setIsOpenCreateComboModal(false)}>Cancel</Button>,
                    <Button key="submit" type="primary" onClick={handleCreateCombo} loading={loading} disabled={selectedRooms.length === 0 || selectedServices.length === 0}>Submit</Button>,
                ]}
            >
                {/* Select Room Type Section */}
                <h3 className="font-semibold text-lg mb-4">1. Select Room Type (Chọn 1 loại phòng)</h3>
                {currentRoomList.length > 0 ? (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            {currentRoomList.map(room => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    baseUrl={baseUrl}
                                    isSelected={!!selectedRooms.find(r => r.id === room.id)}
                                    onSelect={handleSelectRoom}
                                />
                            ))}
                        </div>
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                current={roomPage}
                                pageSize={limit}
                                total={roomList.length}
                                onChange={setRoomPage}
                            />
                        </div>
                    </>
                ) : <p className="text-gray-500">No rooms available</p>}

                <div className="mt-6 p-4 bg-blue-50 rounded">
                    <p className="text-sm font-medium">Selected Room ({selectedRooms.length}):</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRooms.map(room => (
                            <Tag key={room.id} closable onClose={() => setSelectedRooms([])} color="blue">
                                {room.name}
                            </Tag>
                        ))}
                    </div>
                </div>

                <hr className="my-6" />

                {/* Select Services Section */}
                <h3 className="font-semibold text-lg mb-4 mt-6">2. Select Services (Chọn một hoặc nhiều dịch vụ)</h3>
                {currentServiceList.length > 0 ? (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            {currentServiceList.map(service => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    isSelected={!!selectedServices.find(s => s.id === service.id)}
                                    onSelect={handleSelectService}
                                />
                            ))}
                        </div>
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                current={servicePage}
                                pageSize={limit}
                                total={serviceList.length}
                                onChange={setServicePage}
                            />
                        </div>
                    </>
                ) : <p className="text-gray-500">No services available</p>}

                <div className="mt-6 p-4 bg-green-50 rounded">
                    <p className="text-sm font-medium">Selected Services ({selectedServices.length}):</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedServices.map(service => (
                            <Tag key={service.id} closable onClose={() => handleSelectService(service)} color="cyan">
                                {service.name}
                            </Tag>
                        ))}
                    </div>
                </div>

                <hr className="my-6" />

                {/* Combo Details Form */}
                <h3 className="font-semibold text-lg mb-4 mt-6">3. Combo Details (Thông tin chi tiết combo)</h3>
                <Form layout="vertical" form={form}>
                    <Form.Item
                        label="Combo Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter combo name' }]}
                    >
                        <Input placeholder="Enter combo name" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea rows={2} placeholder="Enter description" />
                    </Form.Item>
                    <div className='flex gap-4'>
                        <Form.Item
                            label="Discount Value (%)"
                            name="discountValue"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Enter discount value' }]}
                        >
                            <InputNumber min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            label="Max Discount Amount"
                            name="maxDiscountAmount"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Enter max discount amount' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            label="Min Stay Nights"
                            name="minStayNights"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Enter minimum stay nights' }]}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            {/* Edit Combo Modal */}
            <Modal
                title="Edit Combo"
                open={isEditModalOpen}
                onOk={handleUpdateCombo}
                onCancel={() => setIsEditModalOpen(false)}
                confirmLoading={isGettingCombo} // Dùng chung loading tạm thời
                width={600}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                >
                    <Form.Item
                        label="Combo Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter combo name' }]}
                    >
                        <Input placeholder="Enter combo name" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea rows={4} placeholder="Enter description" />
                    </Form.Item>
                    <div className='flex gap-4'>
                        <Form.Item
                            label="Discount Value (%)"
                            name="discountValue"
                            rules={[{ required: true, message: 'Please enter discount value' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                min={0}
                                max={100}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Max Discount Amount"
                            name="maxDiscountAmount"
                            rules={[{ required: true, message: 'Please enter max discount amount' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Min Stay Nights"
                            name="minStayNights"
                            rules={[{ required: true, message: 'Please enter minimum stay nights' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                min={1}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}

export default ComboManagement;