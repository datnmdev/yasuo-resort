import {
  Button,
  Table,
  Space,
  Input,
  Pagination,
  Tag,
  Popover,
  Tree,
  Modal,
  Card,
  Form,
  Avatar,
  Alert,
  Tooltip,
  Flex,
  DatePicker,
  Select
} from 'antd';
import {
  FilterOutlined,
  FilePdfOutlined,
  FileSearchOutlined,
  FileAddOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
  CustomerServiceOutlined,
  CheckOutlined,
  StopOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import useFetch from '../../hooks/fetch.hook';
import apis from '../../apis/index';
import { useEffect, useState } from 'react';
import useToast from '../../hooks/toast.hook';
import moment from 'moment';
import TextEditor from '@src/components/TextEditor';
import dayjs from 'dayjs';

export default function BookingRequestPage() {
  const [getBookingsReq, setGetBookingsReq] = useState({
    page: 1,
    limit: 10,
  });
  const {
    data: bookings,
    isLoading: isGettingBookings,
    setRefetch: setReGetBookings,
  } = useFetch(apis.booking.getBookings, getBookingsReq);
  const [tableData, setTableData] = useState([[], 0]);
  const { openNotification, contextHolder } = useToast();
  const [rejectBookingReq, setRejectBookingReq] = useState(null);
  const {
    data: rejectBookingResData,
    isLoading: isRejectingBooking,
    setRefetch: setReRejectBooking,
  } = useFetch(apis.booking.rejectBooking, rejectBookingReq, false);
  const [createContractReq, setCreateContractReq] = useState(null);
  const {
    data: createContractResData,
    isLoading: isCreatingContract,
    setRefetch: setReCreateContract,
  } = useFetch(apis.booking.createContract, createContractReq, false);
  const [selectedBookingToPreview, setSelectedBookingToPreview] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [isOpenContractPreviewModal, setOpenContractPreviewModal] = useState(false);
  const [isOpenBookingDetailModal, setOpenBookingDetailModal] = useState(false);
  const [undoContractReq, setUndoContractReq] = useState(null);
  const {
    data: undoContractResData,
    isLoading: isUndoingContract,
    setRefetch: setReUndoContract,
  } = useFetch(apis.booking.undoContract, undoContractReq, false);
  const [isOpenReasonOfRejectionModal, setOpenReasonOfRejectionModal] = useState(false);
  const [rejectBookingForm] = Form.useForm();
  const [selectedRowToReject, setSelectedRowToReject] = useState(null);
  const [isOpenServiceBookingRequestModal, setOpenServiceBookingRequestModal] = useState(false);
  const [selectedBookingToOpenServiceBookingRequestModal, setSelectedBookingToOpenServiceBookingRequestModal] =
    useState(null);
  const [serviceBookingTableData, setServiceBookingTableData] = useState([]);
  const [selectedBookingServiceToConfirm, setSelectedBookingServiceToConfirm] = useState(null);
  const [confirmBookingServiceReq, setConfirmBookingServiceReq] = useState(null);
  const {
    data: confirmBookingServiceResData,
    isLoading: isConfirmingBookingService,
    setRefetch: setReConfirmBookingService,
  } = useFetch(apis.booking.confirmBookingService, confirmBookingServiceReq, false);
  const [isOpenReasonForTheServiceBookingRejectionModal, setOpenReasonForTheServiceBookingRejectionModal] =
    useState(false);
  const [rejectServiceBookingForm] = Form.useForm();
  const [selectedServiceBookingToReject, setSelectedServiceBookingToReject] = useState(null);
  const [rejectServiceBookingReq, setRejectServiceBookingReq] = useState(null);
  const {
    data: rejectServiceBookingResData,
    isLoading: isRejectingServiceBooking,
    setRefetch: setReRejectServiceBooking,
  } = useFetch(apis.booking.rejectServiceBooking, rejectServiceBookingReq, false);
  const [selectedBookingToChangeRoom, setSelectedBookingToChangeRoom] = useState(null);
  const [changeRoomReq, setChangeRoomReq] = useState(null);
  const {
    data: changeRoomResData,
    isLoading: isChangingRoom,
    setRefetch: setReChangeRoom,
  } = useFetch(apis.booking.changeRoom, changeRoomReq, false);
  const [getRoomsReq, setGetRoomsReq] = useState(null);
  const {
    data: getRoomsResData,
    setRefetch: setReGetRooms,
  } = useFetch(apis.room.getRooms, getRoomsReq, false);
  const [isOpenChangeRoomModal, setOpenChangeRoomModal] = useState(false);
  const [changeRoomForm] = Form.useForm();

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'User Id',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Room Number',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, record) => {
        let color;
        switch (record.status) {
          case 'pending':
            color = 'gray';
            break;
          case 'confirmed':
            color = 'green';
            break;
          default:
            color = 'volcano';
        }

        return <Tag color={color}>{record.status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Flex gap="small" wrap align="center" style={{ maxWidth: 120 }}>
          <Tooltip title="View detail">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => {
                const selectedRow = bookings?.data?.[0]?.find((item) => item.id === record.id);
                setSelectedBookingDetail(selectedRow ? { ...selectedRow } : null);
              }}
            />
          </Tooltip>

          <Tooltip title="Create contract">
            <Button
              shape="circle"
              icon={<FileAddOutlined />}
              onClick={() =>
                setCreateContractReq({
                  param: {
                    bookingId: record.id,
                  },
                })
              }
              loading={createContractReq?.param?.bookingId === record.id && isCreatingContract}
              hidden={!(record.status === 'pending' && !record.contract)}
            />
          </Tooltip>

          <Tooltip title="View contract">
            <Button
              shape="circle"
              icon={<FileSearchOutlined />}
              onClick={() => {
                const selectedRow = bookings?.data?.[0]?.find((item) => item.id === record.id);
                setSelectedBookingToPreview(selectedRow ? { ...selectedRow } : null);
              }}
              hidden={!(record.contract && (record.status === 'pending' || record.status === 'confirmed'))}
            />
          </Tooltip>

          <Tooltip title="Undo contract">
            <Button
              shape="circle"
              icon={<RollbackOutlined />}
              onClick={() =>
                setUndoContractReq({
                  param: {
                    bookingId: record.id,
                  },
                })
              }
              loading={undoContractReq?.param?.bookingId === record.id && isUndoingContract}
              hidden={!(record.contract && record.status === 'pending')}
            />
          </Tooltip>

          <Tooltip title="Reject booking">
            <Button
              shape="circle"
              icon={<CloseCircleOutlined />}
              onClick={() => setSelectedRowToReject(record)}
              loading={rejectBookingReq?.param?.bookingId === record.id && isRejectingBooking}
              hidden={!(record.status === 'pending' && !record.contract)}
            />
          </Tooltip>

          <Tooltip title="Service Booking Requests">
            <Button
              shape="circle"
              icon={<CustomerServiceOutlined />}
              onClick={() => setSelectedBookingToOpenServiceBookingRequestModal({
                ...record
              })}
              type={record?.bookingServices?.some((s) => s.status === 'pending') ? 'primary' : 'default'}
              primary={record?.bookingServices?.some((s) => s.status === 'pending')}
              hidden={record.status !== 'confirmed'}
            />
          </Tooltip>

          <Tooltip title="Change Room">
            <Button
              shape="circle"
              icon={<SwapOutlined />}
              onClick={() =>
                setSelectedBookingToChangeRoom({
                  ...record,
                })
              }
              loading={changeRoomReq?.param?.id === record.id && isChangingRoom}
              hidden={record.status === 'rejected' || record.status === 'cancelled' || moment().diff(moment(record.endDate), 'days') > 0}
            />
          </Tooltip>
        </Flex>
      ),
    },
  ];

  const serviceBookingRequestTableColumns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Booking Id',
      dataIndex: 'bookingId',
      key: 'bookingId',
    },
    {
      title: 'Service Id',
      dataIndex: 'serviceId',
      key: 'serviceId',
    },
    {
      title: 'Service Name',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, record) => {
        let color;
        switch (record.status) {
          case 'pending':
            color = 'gray';
            break;
          case 'confirmed':
            color = 'green';
            break;
          default:
            color = 'volcano';
        }

        return <Tag color={color}>{record.status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Flex gap="small" wrap align="center" style={{ maxWidth: 120 }}>
          <Tooltip title="Confirm">
            <Button
              shape="circle"
              icon={<CheckOutlined />}
              onClick={() => {
                setSelectedBookingServiceToConfirm({
                  ...record,
                });
              }}
              loading={confirmBookingServiceReq?.param?.id === record.id && isConfirmingBookingService}
              hidden={!(record.status === 'pending')}
            />
          </Tooltip>

          <Tooltip title="Reject">
            <Button
              shape="circle"
              icon={<StopOutlined />}
              onClick={() =>
                setSelectedServiceBookingToReject({
                  ...record,
                })
              }
              loading={rejectServiceBookingReq?.param?.id === record.id && isRejectingServiceBooking}
              hidden={record.status !== 'pending'}
            />
          </Tooltip>
        </Flex>
      ),
    },
  ];

  async function handleRejectBookingSubmit() {
    try {
      const values = await rejectBookingForm.validateFields();
      setRejectBookingReq({
        param: {
          bookingId: values.bookingId,
        },
        body: {
          reason: values.reasonForRejection,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleRejectServiceBookingSubmit() {
    try {
      const values = await rejectServiceBookingForm.validateFields();
      setRejectServiceBookingReq({
        param: {
          id: values.id,
        },
        body: {
          reasonForRejection: values.reasonForRejection,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
  async function handleChangeRoomSubmit() {
    try {
      const values = await changeRoomForm.validateFields();
      setChangeRoomReq({
        body: {
          ...values,
          changeDate: dayjs(values.changeDate).format('YYYY-MM-DD')
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setReGetBookings({
      value: true,
    });
  }, [getBookingsReq]);

  useEffect(() => {
    if (!isGettingBookings) {
      if (bookings && bookings.isSuccess) {
        setTableData([
          bookings.data[0].map((booking) => ({
            ...booking,
            key: booking.id,
            roomNumber: booking.roomChangeHistories.length > 0 ? `${booking.roomChangeHistories.sort((a, b) => b.id - a.id)[0].fromRoom.roomNumber} (cũ) -> ${booking.roomChangeHistories.sort((a, b) => b.id - a.id)[0].toRoom.roomNumber} (mới)` : booking.room.roomNumber,
            createdAt: moment(booking.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            startDate: moment(booking.startDate).format('DD/MM/YYYY'),
            endDate: moment(booking.endDate).format('DD/MM/YYYY'),
            totalPrice: `$${booking.totalPrice}`,
          })),
          bookings.data[1],
        ]);
        if (selectedBookingToOpenServiceBookingRequestModal && isOpenServiceBookingRequestModal) {
          const serviceBookings =
            bookings.data[0].find((booking) => booking.id === selectedBookingToOpenServiceBookingRequestModal.id)
              ?.bookingServices ?? [];
          setServiceBookingTableData(
            serviceBookings.map((serviceBooking) => ({
              ...serviceBooking,
              startDate: moment(serviceBooking.startDate).format('DD/MM/YYYY'),
              endDate: moment(serviceBooking.endDate).format('DD/MM/YYYY'),
              serviceName: serviceBooking.service.name
            }))
          );
        }
      }
    }
  }, [isGettingBookings]);

  useEffect(() => {
    if (rejectBookingReq) {
      setReRejectBooking({
        value: true,
      });
    }
  }, [rejectBookingReq]);

  useEffect(() => {
    if (createContractReq) {
      setReCreateContract({
        value: true,
      });
    }
  }, [createContractReq]);

  useEffect(() => {
    if (!isRejectingBooking) {
      if (rejectBookingResData) {
        if (rejectBookingResData.isSuccess) {
          openNotification({
            title: 'The booking has been rejected successfully',
          });
          setReGetBookings({
            value: true,
          });
          setOpenReasonOfRejectionModal(false);
        } else {
          openNotification({
            title: rejectBookingResData.error.message.toString(),
          });
        }
      }
    }
  }, [isRejectingBooking]);

  useEffect(() => {
    if (!isCreatingContract) {
      if (createContractResData) {
        if (createContractResData.isSuccess) {
          openNotification({
            title: 'The contract has been created successfully',
          });
          setReGetBookings({
            value: true,
          });
        } else {
          openNotification({
            title: createContractResData.error.message.toString(),
          });
        }
      }
    }
  }, [isCreatingContract]);

  useEffect(() => {
    if (undoContractReq) {
      setReUndoContract({
        value: true,
      });
    }
  }, [undoContractReq]);

  useEffect(() => {
    if (!isUndoingContract) {
      if (undoContractResData) {
        if (undoContractResData.isSuccess) {
          openNotification({
            title: 'The contract has been undone successfully',
          });
          setReGetBookings({
            value: true,
          });
        } else {
          openNotification({
            title: undoContractResData.error.message.toString(),
          });
        }
      }
    }
  }, [isUndoingContract]);

  useEffect(() => {
    if (selectedBookingToPreview) {
      setOpenContractPreviewModal(true);
    }
  }, [selectedBookingToPreview]);

  useEffect(() => {
    if (selectedBookingDetail) {
      setOpenBookingDetailModal(true);
    }
  }, [selectedBookingDetail]);

  useEffect(() => {
    if (selectedRowToReject) {
      rejectBookingForm.setFieldsValue({
        bookingId: selectedRowToReject.id,
        reasonForRejection: '',
      });
      setOpenReasonOfRejectionModal(true);
    }
  }, [selectedRowToReject]);

  useEffect(() => {
    if (selectedBookingToOpenServiceBookingRequestModal) {
      setServiceBookingTableData(() =>
        selectedBookingToOpenServiceBookingRequestModal.bookingServices.map((serviceBooking) => ({
          ...serviceBooking,
          startDate: moment(serviceBooking.startDate).format('DD/MM/YYYY'),
          endDate: moment(serviceBooking.endDate).format('DD/MM/YYYY'),
          serviceName: serviceBooking.service.name
        }))
      );
      setOpenServiceBookingRequestModal(true);
    }
  }, [selectedBookingToOpenServiceBookingRequestModal]);

  useEffect(() => {
    if (selectedBookingServiceToConfirm) {
      setConfirmBookingServiceReq({
        param: {
          id: selectedBookingServiceToConfirm.id,
        },
      });
    }
  }, [selectedBookingServiceToConfirm]);

  useEffect(() => {
    if (confirmBookingServiceReq) {
      setReConfirmBookingService({
        value: true,
      });
    }
  }, [confirmBookingServiceReq]);

  useEffect(() => {
    if (!isConfirmingBookingService) {
      if (confirmBookingServiceResData) {
        if (confirmBookingServiceResData.isSuccess) {
          openNotification({
            title: 'The service booking has been confirmed successfully',
          });
          setReGetBookings({
            value: true,
          });
        } else {
          openNotification({
            title: confirmBookingServiceResData.error.message.toString(),
          });
        }
      }
    }
  }, [isConfirmingBookingService]);

  useEffect(() => {
    if (selectedServiceBookingToReject) {
      rejectServiceBookingForm.setFieldsValue({
        id: selectedServiceBookingToReject.id,
        reasonForRejection: '',
      });
      setOpenReasonForTheServiceBookingRejectionModal(true);
    }
  }, [selectedServiceBookingToReject]);

  useEffect(() => {
    if (rejectServiceBookingReq) {
      setReRejectServiceBooking({
        value: true,
      });
    }
  }, [rejectServiceBookingReq]);

  useEffect(() => {
    if (!isRejectingServiceBooking) {
      if (rejectServiceBookingResData) {
        if (rejectServiceBookingResData.isSuccess) {
          openNotification({
            title: 'The service booking has been rejected successfully',
          });
          setReGetBookings({
            value: true,
          });
          setOpenReasonForTheServiceBookingRejectionModal(false);
        } else {
          openNotification({
            title: rejectServiceBookingResData.error.message.toString(),
          });
        }
      }
    }
  }, [isRejectingServiceBooking]);

  useEffect(() => {
    if (selectedBookingToChangeRoom) {
      setGetRoomsReq({
        'dateRange[startDate]': moment(selectedBookingToChangeRoom.startDate, "DD-MM-YYYY").format('YYYY-MM-DD'),
        'dateRange[endDate]': moment(selectedBookingToChangeRoom.endDate, "DD-MM-YYYY").format('YYYY-MM-DD'),
        page: 1,
        limit: Number.MAX_SAFE_INTEGER,
        typeId: selectedBookingToChangeRoom.room.typeId
      });
    }
  }, [selectedBookingToChangeRoom]);

  useEffect(() => {
    if (getRoomsReq) {
      setReGetRooms({
        value: true,
      });
    }
  }, [getRoomsReq]);

  useEffect(() => {
    if (selectedBookingToChangeRoom) {
      changeRoomForm.resetFields();
      const currRoom = selectedBookingToChangeRoom.roomChangeHistories.sort((a, b) => b.id - a.id)?.[0]
      changeRoomForm.setFieldsValue({
        bookingId: selectedBookingToChangeRoom.id,
        fromRoomId: currRoom ? currRoom.toRoomId : selectedBookingToChangeRoom.roomId
      })
      setOpenChangeRoomModal(true)
    }
  }, [selectedBookingToChangeRoom])

  useEffect(() => {
    if (changeRoomReq) {
      setReChangeRoom({
        value: true,
      });
    }
  }, [changeRoomReq]);

  useEffect(() => {
    if (!isChangingRoom) {
      if (changeRoomResData) {
        if (changeRoomResData.isSuccess) {
          openNotification({
            title: 'Room changed successfully ',
          });
          setReGetBookings({
            value: true,
          });
          setOpenChangeRoomModal(false);
        } else {
          openNotification({
            title: changeRoomResData.error.message.toString(),
          });
        }
      }
    }
  }, [isChangingRoom]);


  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div></div>
        <div className="flex space-x-2">
          <div>
            <Input.Search
              placeholder="Type booking ID..."
              enterButton
              loading={getBookingsReq.name ? isGettingBookings : false}
              onSearch={(value) =>
                setGetBookingsReq({
                  ...getBookingsReq,
                  id: value,
                })
              }
            />
          </div>

          <div>
            <Popover
              content={
                <>
                  <Tree
                    style={{ minWidth: 242 }}
                    selectable={false}
                    defaultExpandedKeys={['status']}
                    defaultSelectedKeys={['status']}
                    defaultCheckedKeys={['status']}
                    checkable
                    treeData={[
                      {
                        title: 'Status',
                        key: 'status',
                        children: [
                          {
                            title: 'PENDING',
                            key: 'pending',
                          },
                          {
                            title: 'CONFIRMED',
                            key: 'confirmed',
                          },
                          {
                            title: 'REJECTED',
                            key: 'rejected',
                          },
                          {
                            title: 'CANCELLED',
                            key: 'cancelled',
                          },
                        ],
                      },
                    ]}
                    onCheck={(selectedStatus) =>
                      setGetBookingsReq({
                        ...getBookingsReq,
                        status:
                          selectedStatus.filter((status) => status != 'status').length > 0
                            ? JSON.stringify(selectedStatus.filter((status) => status != 'status'))
                            : [],
                      })
                    }
                  />
                </>
              }
              trigger={['click']}
            >
              <Button>
                <FilterOutlined />
                Filter
              </Button>
            </Popover>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Table columns={columns} dataSource={tableData[0]} pagination={false} />

        <div className="mt-4 flex justify-center">
          <Pagination
            showQuickJumper
            defaultCurrent={getBookingsReq.page}
            total={tableData[1]}
            pageSize={getBookingsReq.limit}
            onChange={(page) =>
              setGetBookingsReq({
                ...getBookingsReq,
                page,
              })
            }
          />
        </div>
      </div>

      <div>
        {/* Contract Preview Modal */}
        <Modal
          title="Contract Preview"
          open={isOpenContractPreviewModal}
          onCancel={() => setOpenContractPreviewModal(false)}
          width={820}
          footer={[
            <Button key="back" onClick={() => setOpenContractPreviewModal(false)}>
              Cancel
            </Button>,
          ]}
        >
          <iframe
            className="w-full h-[520px]"
            src={`${import.meta.env.VITE_API_BASE_URL}/${selectedBookingToPreview?.contract?.contractUrl}`}
            frameborder="0"
          ></iframe>
        </Modal>

        {/* View Booking Detail Modal */}
        <Modal
          title="Booking Detail"
          open={isOpenBookingDetailModal}
          onCancel={() => setOpenBookingDetailModal(false)}
          width={820}
          footer={[
            <Button key="back" onClick={() => setOpenBookingDetailModal(false)}>
              Cancel
            </Button>,
          ]}
        >
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Card title="General" size="small">
              <Space direction="horizontal" size="large" wrap>
                <Form.Item label="Booking Id">
                  <Input value={selectedBookingDetail?.id} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Start Date">
                  <Input
                    value={moment(selectedBookingDetail?.startDate).format('DD-MM-YYYY')}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="End Date">
                  <Input value={moment(selectedBookingDetail?.endDate).format('DD-MM-YYYY')} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Room Price">
                  <Input value={'$' + selectedBookingDetail?.roomPrice} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Total Price">
                  <Input value={'$' + selectedBookingDetail?.totalPrice} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Status">
                  <Tag
                    style={{ lineHeight: '32px' }}
                    color={
                      selectedBookingDetail?.status === 'pending'
                        ? 'gray'
                        : selectedBookingDetail?.status === 'confirmed'
                          ? 'green'
                          : 'volcano'
                    }
                  >
                    {selectedBookingDetail?.status?.toUpperCase()}
                  </Tag>
                </Form.Item>

                <Form.Item label="Reason For Rejection" hidden={selectedBookingDetail?.status !== 'rejected'}>
                  <div
                    className="border-[1px] border-solid border-gray-300 rounded-[8px] px-2 py-1"
                    dangerouslySetInnerHTML={{ __html: selectedBookingDetail?.reasonForRejection }}
                  />
                </Form.Item>
              </Space>
            </Card>

            <Card title="User" size="small">
              <div className="mb-4">
                <Avatar
                  style={{ width: 120, height: 120 }}
                  src={`${import.meta.env.VITE_API_BASE_URL}/${selectedBookingDetail?.user?.avatar}`}
                />
              </div>

              <Space direction="horizontal" size="large" wrap>
                <Form.Item label="User Id">
                  <Input value={selectedBookingDetail?.user?.id} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Full Name">
                  <Input value={selectedBookingDetail?.user?.name} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Phone">
                  <Input value={selectedBookingDetail?.user?.phone} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Email">
                  <Input value={selectedBookingDetail?.user?.email} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Gender">
                  <Input value={selectedBookingDetail?.user?.gender} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Date Of Birth">
                  <Input
                    value={moment(selectedBookingDetail?.user?.dob).format('DD-MM-YYYY')}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="CCCD">
                  <Input value={selectedBookingDetail?.user?.cccd} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Identity Issued At">
                  <Input
                    value={moment(selectedBookingDetail?.user?.identityIssuedAt).format('DD-MM-YYYY')}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Identity Issued Place">
                  <Input value={selectedBookingDetail?.user?.identityIssuedPlace} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Permanent Address">
                  <Input value={selectedBookingDetail?.user?.permanentAddress} contentEditable="false" />
                </Form.Item>
              </Space>
            </Card>

            <Card title="Room" size="small">
              <Space direction="horizontal" size="large" wrap>
                <Form.Item label="Room Id">
                  <Input value={selectedBookingDetail?.room?.id} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Room Type">
                  <Input value={selectedBookingDetail?.room?.type?.name} contentEditable="false" />
                </Form.Item>

                <Form.Item label="Room Number">
                  <Input value={selectedBookingDetail?.room?.roomNumber} contentEditable="false" />
                </Form.Item>
              </Space>
            </Card>

            <Card title="Booked Services" size="small">
              <Table
                columns={[
                  {
                    title: 'Id',
                    dataIndex: 'id',
                    key: 'id',
                  },
                  {
                    title: 'Service Name',
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Price',
                    dataIndex: 'price',
                    key: 'price',
                  },
                ]}
                dataSource={selectedBookingDetail?.bookingServices?.map((bookingService) => ({
                  id: bookingService.service.id,
                  name: bookingService.service.name,
                  quantity: bookingService.quantity,
                  price: bookingService.price,
                }))}
              />
            </Card>

            <Card
              title="Contract"
              size="small"
              hidden={
                selectedBookingDetail?.status == 'rejected' ||
                selectedBookingDetail?.status == 'cancelled' ||
                !selectedBookingDetail?.contract
              }
            >
              <Space direction="vertical" size="middle">
                {selectedBookingDetail?.contract?.signedByUser ? (
                  <Alert message="The contract has been signed by both parties" type="success" />
                ) : (
                  <Alert message="The contract is pending the guest's signature" type="error" />
                )}

                <Button
                  icon={<FilePdfOutlined style={{ color: 'red' }} />}
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_API_BASE_URL}/${selectedBookingDetail?.contract?.contractUrl}`,
                      '_blank'
                    )
                  }
                >
                  {selectedBookingDetail?.contract?.contractUrl?.substring(
                    selectedBookingDetail?.contract?.contractUrl?.lastIndexOf('/') + 1
                  )}
                </Button>
              </Space>
            </Card>
          </Space>
        </Modal>

        {/* Reason For Rejection Modal */}
        <Modal
          title="Reason For Rejection"
          open={isOpenReasonOfRejectionModal}
          onCancel={() => setOpenReasonOfRejectionModal(false)}
          width={520}
          footer={[
            <Button key="back" onClick={() => setOpenContractPreviewModal(false)}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleRejectBookingSubmit} loading={isRejectingBooking}>
              Submit
            </Button>,
          ]}
        >
          <Form layout="vertical" form={rejectBookingForm} name="control-hooks" style={{ marginTop: 16 }}>
            <Form.Item name="bookingId" label="Booking Id">
              <Input disabled />
            </Form.Item>

            <Form.Item name="reasonForRejection" label="Reason For Rejection" rules={[{ required: true }]}>
              <TextEditor
                disabled={isRejectingBooking}
                initialValue={rejectBookingForm.getFieldValue('reasonForRejection')}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Service Booking Request */}
        <Modal
          title="Service Booking Request"
          open={isOpenServiceBookingRequestModal}
          onCancel={() => setOpenServiceBookingRequestModal(false)}
          width={1024}
          footer={[]}
        >
          <Table columns={serviceBookingRequestTableColumns} dataSource={serviceBookingTableData} pagination={true} />
        </Modal>

        {/* Reject Booking Service Modal */}
        <Modal
          title="Reason For The Service Booking Rejection"
          open={isOpenReasonForTheServiceBookingRejectionModal}
          onCancel={() => setOpenReasonForTheServiceBookingRejectionModal(false)}
          width={520}
          footer={[
            <Button key="back" onClick={() => setOpenReasonForTheServiceBookingRejectionModal(false)}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleRejectServiceBookingSubmit}
              loading={isRejectingServiceBooking}
            >
              Submit
            </Button>,
          ]}
        >
          <Form layout="vertical" form={rejectServiceBookingForm} name="control-hooks" style={{ marginTop: 16 }}>
            <Form.Item name="id" label="Service Booking Id">
              <Input disabled />
            </Form.Item>

            <Form.Item name="reasonForRejection" label="Reason For Rejection" rules={[{ required: true }]}>
              <TextEditor
                disabled={isRejectingServiceBooking}
                initialValue={rejectServiceBookingForm.getFieldValue('reasonForRejection')}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Change Room Modal */}
        <Modal
          title="Change Room"
          open={isOpenChangeRoomModal}
          onCancel={() => setOpenChangeRoomModal(false)}
          width={520}
          footer={[
            <Button key="back" onClick={() => setOpenChangeRoomModal(false)}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleChangeRoomSubmit} loading={isChangingRoom}>
              Submit
            </Button>,
          ]}
        >
          <Form layout="vertical" form={changeRoomForm} name="control-hooks" style={{ marginTop: 16 }}>
            <Form.Item name="bookingId" label="Booking Id">
              <Input disabled />
            </Form.Item>

            <Form.Item name="fromRoomId" label="From Room Id">
              <Input disabled />
            </Form.Item>

            <Form.Item name="toRoomId" label="To Room Id" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Select a room..."
                optionFilterProp="label"
                onChange={(value) => changeRoomForm.setFieldValue('toRoomId', value)}
                options={
                  getRoomsResData?.isSuccess
                    ? getRoomsResData.data[0].filter(item => selectedBookingToChangeRoom.roomChangeHistories.sort((a, b) => b.id - a.id)?.[0]?.toRoomId != item.id).map((room) => ({
                      label: room.roomNumber,
                      value: room.id,
                    }))
                    : []
                }
              />
            </Form.Item>

            <Form.Item name="changeDate" label="Change Date" rules={[{ required: true }]}>
              <DatePicker
                format="DD-MM-YYYY"
                disabledDate={(current) => {
                  return current && current < moment().startOf('days');
                }}
                style={{ width: '100%' }}
                disabled={isChangingRoom}
              />
            </Form.Item>

            <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
              <TextEditor disabled={isChangingRoom} initialValue={changeRoomForm.getFieldValue('reason')} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      {contextHolder}
    </div>
  );
}
