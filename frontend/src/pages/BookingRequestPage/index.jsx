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
} from "antd";
import { FilterOutlined, FilePdfOutlined } from "@ant-design/icons";
import useFetch from "../../hooks/fetch.hook";
import apis from "../../apis/index";
import { useEffect, useState } from "react";
import useToast from "../../hooks/toast.hook";
import moment from "moment";

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
  const [cancelBookingReq, setCancelBookingReq] = useState(null);
  const {
    data: cancelBookingResData,
    isLoading: isCancellingBooking,
    setRefetch: setReCancelBooking,
  } = useFetch(apis.booking.cancelBooking, cancelBookingReq, false);
  const [createContractReq, setCreateContractReq] = useState(null);
  const {
    data: createContractResData,
    isLoading: isCreatingContract,
    setRefetch: setReCreateContract,
  } = useFetch(apis.booking.createContract, createContractReq, false);
  const [selectedBookingToPreview, setSelectedBookingToPreview] =
    useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [isOpenContractPreviewModal, setOpenContractPreviewModal] =
    useState(false);
  const [isOpenBookingDetailModal, setOpenBookingDetailModal] = useState(false);

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "User Id",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Room Id",
      dataIndex: "roomId",
      key: "roomId",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (_, record) => {
        let color;
        switch (record.status) {
          case "pending":
            color = "gray";
            break;
          case "confirmed":
            color = "green";
            break;
          default:
            color = "volcano";
        }

        return <Tag color={color}>{record.status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small" wrap style={{ maxWidth: 142 }}>
          <Button
            shape="round"
            color="cyan"
            variant="solid"
            onClick={() => {
              const selectedRow = bookings?.data?.[0]?.find(
                (item) => item.id === record.id
              );
              setSelectedBookingDetail(selectedRow ? { ...selectedRow } : null);
            }}
          >
            View detail
          </Button>

          <Button
            shape="round"
            color="primary"
            variant="solid"
            hidden={record.status != "pending" || record.contract}
            onClick={() =>
              setCreateContractReq({
                param: {
                  bookingId: record.id,
                },
              })
            }
            loading={
              createContractReq?.param?.bookingId === record.id &&
              isCreatingContract
            }
          >
            Create contract
          </Button>

          <Button
            shape="round"
            color="primary"
            variant="solid"
            hidden={record.status != "confirmed"}
            onClick={() => {
              const selectedRow = bookings?.data?.[0]?.find(
                (item) => item.id === record.id
              );
              setSelectedBookingToPreview(
                selectedRow ? { ...selectedRow } : null
              );
            }}
          >
            View contract
          </Button>

          <Button
            shape="round"
            color="danger"
            variant="solid"
            hidden={record.status != "pending"}
            onClick={() =>
              setCancelBookingReq({
                param: {
                  bookingId: record.id,
                },
              })
            }
            loading={
              cancelBookingReq?.param?.bookingId === record.id &&
              isCancellingBooking
            }
          >
            Cancel booking
          </Button>
        </Space>
      ),
    },
  ];

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
          })),
          bookings.data[1],
        ]);
      }
    }
  }, [isGettingBookings]);

  useEffect(() => {
    if (cancelBookingReq) {
      setReCancelBooking({
        value: true,
      });
    }
  }, [cancelBookingReq]);

  useEffect(() => {
    if (createContractReq) {
      setReCreateContract({
        value: true,
      });
    }
  }, [createContractReq]);

  useEffect(() => {
    if (!isCancellingBooking) {
      if (cancelBookingResData) {
        if (cancelBookingResData.isSuccess) {
          openNotification({
            title: "The booking has been cancelled",
          });
          setReGetBookings({
            value: true,
          });
        } else {
          openNotification({
            title: cancelBookingResData.error.message.toString(),
          });
        }
      }
    }
  }, [isCancellingBooking]);

  useEffect(() => {
    if (!isCreatingContract) {
      if (createContractResData) {
        if (createContractResData.isSuccess) {
          openNotification({
            title: "The contract has been created successfully",
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
    if (selectedBookingToPreview) {
      setOpenContractPreviewModal(true);
    }
  }, [selectedBookingToPreview]);

  useEffect(() => {
    if (selectedBookingDetail) {
      setOpenBookingDetailModal(true);
    }
  }, [selectedBookingDetail]);

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
                    defaultExpandedKeys={["status"]}
                    defaultSelectedKeys={["status"]}
                    defaultCheckedKeys={["status"]}
                    checkable
                    treeData={[
                      {
                        title: "Status",
                        key: "status",
                        children: [
                          {
                            title: "PENDING",
                            key: "pending",
                          },
                          {
                            title: "CONFIRMED",
                            key: "confirmed",
                          },
                          {
                            title: "CANCELLED",
                            key: "cancelled",
                          },
                        ],
                      },
                    ]}
                    onCheck={(selectedStatus) =>
                      setGetBookingsReq({
                        ...getBookingsReq,
                        status:
                          selectedStatus.filter((status) => status != "status")
                            .length > 0
                            ? JSON.stringify(
                                selectedStatus.filter(
                                  (status) => status != "status"
                                )
                              )
                            : [],
                      })
                    }
                  />
                </>
              }
              trigger={["click"]}
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
            <Button
              key="back"
              onClick={() => setOpenContractPreviewModal(false)}
            >
              Cancel
            </Button>,
          ]}
        >
          <iframe
            className="w-full h-[520px]"
            src={`${import.meta.env.VITE_API_BASE_URL}/${
              selectedBookingToPreview?.contract?.contractUrl
            }`}
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
          <Space direction="vertical" size="middle" style={{ display: "flex" }}>
            <Card title="General" size="small">
              <Space direction="horizontal" size="large" wrap>
                <Form.Item label="Booking Id">
                  <Input
                    value={selectedBookingDetail?.id}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Start Date">
                  <Input
                    value={moment(selectedBookingDetail?.startDate).format(
                      "DD-MM-YYYY"
                    )}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="End Date">
                  <Input
                    value={moment(selectedBookingDetail?.endDate).format(
                      "DD-MM-YYYY"
                    )}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Room Price">
                  <Input
                    value={"$" + selectedBookingDetail?.roomPrice}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Total Price">
                  <Input
                    value={"$" + selectedBookingDetail?.totalPrice}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Status">
                  <Tag
                    style={{ lineHeight: "32px" }}
                    color={
                      selectedBookingDetail?.status === "pending"
                        ? "gray"
                        : selectedBookingDetail?.status === "confirmed"
                        ? "green"
                        : "volcano"
                    }
                  >
                    {selectedBookingDetail?.status?.toUpperCase()}
                  </Tag>
                </Form.Item>
              </Space>
            </Card>

            <Card title="User" size="small">
              <div className="mb-4">
                <Avatar
                  style={{ width: 120, height: 120 }}
                  src={`${import.meta.env.VITE_API_BASE_URL}/${
                    selectedBookingDetail?.user?.avatar
                  }`}
                />
              </div>

              <Space direction="horizontal" size="large" wrap>
                <Form.Item label="User Id">
                  <Input
                    value={selectedBookingDetail?.user?.id}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Full Name">
                  <Input
                    value={selectedBookingDetail?.user?.name}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Phone">
                  <Input
                    value={selectedBookingDetail?.user?.phone}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Email">
                  <Input
                    value={selectedBookingDetail?.user?.email}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Gender">
                  <Input
                    value={selectedBookingDetail?.user?.gender}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Date Of Birth">
                  <Input
                    value={moment(selectedBookingDetail?.user?.dob).format(
                      "DD-MM-YYYY"
                    )}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="CCCD">
                  <Input
                    value={selectedBookingDetail?.user?.cccd}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Identity Issued At">
                  <Input
                    value={moment(
                      selectedBookingDetail?.user?.identityIssuedAt
                    ).format("DD-MM-YYYY")}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Identity Issued Place">
                  <Input
                    value={selectedBookingDetail?.user?.identityIssuedPlace}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Permanent Address">
                  <Input
                    value={selectedBookingDetail?.user?.permanentAddress}
                    contentEditable="false"
                  />
                </Form.Item>
              </Space>
            </Card>

            <Card title="Room" size="small">
              <Space direction="horizontal" size="large" wrap>
                <Form.Item label="Room Id">
                  <Input
                    value={selectedBookingDetail?.room?.id}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Room Type">
                  <Input
                    value={selectedBookingDetail?.room?.type?.name}
                    contentEditable="false"
                  />
                </Form.Item>

                <Form.Item label="Room Number">
                  <Input
                    value={selectedBookingDetail?.room?.roomNumber}
                    contentEditable="false"
                  />
                </Form.Item>
              </Space>
            </Card>

            <Card title="Booked Services" size="small">
              <Table
                columns={[
                  {
                    title: "Id",
                    dataIndex: "id",
                    key: "id",
                  },
                  {
                    title: "Service Name",
                    dataIndex: "name",
                    key: "name",
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                  },
                  {
                    title: "Price",
                    dataIndex: "price",
                    key: "price",
                  },
                ]}
                dataSource={selectedBookingDetail?.bookingServices?.map(
                  (bookingService) => ({
                    id: bookingService.service.id,
                    name: bookingService.service.name,
                    quantity: bookingService.quantity,
                    price: bookingService.price,
                  })
                )}
              />
            </Card>

            <Card
              title="Contract"
              size="small"
              hidden={
                selectedBookingDetail?.status == "cancelled" ||
                !selectedBookingDetail?.contract
              }
            >
              <Space direction="vertical" size="middle">
                {selectedBookingDetail?.contract?.signedByUser ? (
                  <Alert
                    message="The contract has been signed by both parties"
                    type="success"
                  />
                ) : (
                  <Alert
                    message="The contract is pending the guest's signature"
                    type="error"
                  />
                )}

                <Button
                  icon={<FilePdfOutlined style={{ color: "red" }} />}
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_API_BASE_URL}/${
                        selectedBookingDetail?.contract?.contractUrl
                      }`,
                      "_blank"
                    )
                  }
                >
                  {selectedBookingDetail?.contract?.contractUrl?.substring(
                    selectedBookingDetail?.contract?.contractUrl?.lastIndexOf(
                      "/"
                    ) + 1
                  )}
                </Button>
              </Space>
            </Card>
          </Space>
        </Modal>
      </div>
      {contextHolder}
    </div>
  );
}
