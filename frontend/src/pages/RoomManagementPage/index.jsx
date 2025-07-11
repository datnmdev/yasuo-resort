import {
  Button,
  Table,
  Space,
  Tooltip,
  Input,
  Pagination,
  Modal,
  Form,
  Tag,
  Select,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import useFetch from "../../hooks/fetch.hook";
import apis from "../../apis/index";
import { useEffect, useState } from "react";
import TextEditor from "../../components/TextEditor";
import useToast from "../../hooks/toast.hook";
import moment from "moment";
import PictureWall from "../../components/PictureWall";

export default function RoomManagementPage() {
  const [getRoomsReq, setGetRoomsReq] = useState({
    page: 1,
    limit: 10,
  });
  const {
    data: rooms,
    isLoading: isGettingRooms,
    setRefetch: setReGetRooms,
  } = useFetch(apis.room.getRooms, getRoomsReq);
  const { data: roomTypes } = useFetch(apis.roomType.getRoomTypes, {
    page: 1,
    limit: Number.MAX_SAFE_INTEGER,
  });
  const [tableData, setTableData] = useState([[], 0]);
  const [isOpenCreateRoomModal, setOpenCreateRoomModal] = useState(false);
  const [isOpenUpdateRoomModal, setOpenUpdateRoomModal] = useState(false);
  const [createRoomForm] = Form.useForm();
  const [updateRoomForm] = Form.useForm();
  const [createRoomReq, setCreateRoomReq] = useState(null);
  const [selectedRoomToUpdate, setSelectedRoomToUpdate] = useState(null);
  const [updateRoomReq, setUpdateRoomReq] = useState(null);
  const {
    data: createRoomResData,
    isLoading: isCreatingRoom,
    setRefetch: setReCreateRoom,
  } = useFetch(apis.room.createRoom, createRoomReq, false);
  const {
    data: updateRoomResData,
    isLoading: isUpdatingRoom,
    setRefetch: setReUpdateRoom,
  } = useFetch(apis.room.updateRoom, updateRoomReq, false);
  const { openNotification, contextHolder } = useToast();
  const [deleteRoomReq, setDeleteRoomReq] = useState(null);
  const {
    data: deleteRoomResData,
    isLoading: isDeletingRoom,
    setRefetch: setReDeleteRoom,
  } = useFetch(apis.room.deleteRoom, deleteRoomReq, false);

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Room Type",
      dataIndex: "roomTypeName",
      key: "roomTypeName",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (_, record) => {
        let color;
        switch (record.status) {
          case "inactive":
            color = "gray";
            break;
          case "active":
            color = "green";
            break;
          case "under_maintenance":
            color = "orange";
            break;
          default:
            color = "volcano";
        }

        return <Tag color={color}>{record.status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Current Condition",
      key: "currentCondition",
      dataIndex: "currentCondition",
      render: (_, record) => {
        let color;
        switch (record.currentCondition) {
          case "available":
            color = "green";
            break;
          default:
            color = "volcano";
            break;
        }

        return <Tag color={color}>{record.currentCondition.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => {
                const selectedItem = rooms?.data?.[0]?.find(
                  (item) => item.id === record.id
                );
                setSelectedRoomToUpdate(
                  selectedItem
                    ? {
                        ...selectedItem,
                        media: selectedItem.media.map((media) => media.path),
                      }
                    : null
                );
              }}
              loading={selectedRoomToUpdate?.id === record.id && isUpdatingRoom}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() =>
                setDeleteRoomReq({
                  roomId: record.id,
                })
              }
              loading={deleteRoomReq?.roomId === record.id && isDeletingRoom}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  async function handleCreateRoomSubmit() {
    try {
      const values = await createRoomForm.validateFields();
      setCreateRoomReq(values);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleUpdateRoomSubmit() {
    try {
      const values = await updateRoomForm.validateFields();
      setUpdateRoomReq({
        param: {
          roomId: selectedRoomToUpdate?.id,
        },
        body: values,
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setReGetRooms({
      value: true,
    });
  }, [getRoomsReq]);

  useEffect(() => {
    if (!isGettingRooms) {
      if (rooms && rooms.isSuccess) {
        setTableData([
          rooms.data[0].map((room) => ({
            ...room,
            key: room.id,
            roomTypeName: room.type.name,
            createdAt: moment(room.createdAt).format("DD/MM/YYYY HH:mm:ss"),
          })),
          rooms.data[1],
        ]);
      }
    }
  }, [isGettingRooms]);

  useEffect(() => {
    if (createRoomReq) {
      setReCreateRoom({
        value: true,
      });
    }
  }, [createRoomReq]);

  useEffect(() => {
    if (updateRoomReq) {
      setReUpdateRoom({
        value: true,
      });
    }
  }, [updateRoomReq]);

  useEffect(() => {
    if (!isCreatingRoom) {
      if (createRoomResData) {
        if (createRoomResData.isSuccess) {
          openNotification({
            title: "Room created successfully!",
          });
          setReGetRooms({
            value: true,
          });
          createRoomForm.resetFields();
          setOpenCreateRoomModal(false);
        } else {
          openNotification({
            title: createRoomResData.error.message,
          });
        }
      }
    }
  }, [isCreatingRoom]);

  useEffect(() => {
    if (selectedRoomToUpdate) {
      updateRoomForm.setFieldsValue(selectedRoomToUpdate);
      setOpenUpdateRoomModal(true);
    }
  }, [selectedRoomToUpdate]);

  useEffect(() => {
    if (!isUpdatingRoom) {
      if (updateRoomResData) {
        if (updateRoomResData.isSuccess) {
          openNotification({
            title: "Room updated successfully!",
          });
          setReGetRooms({
            value: true,
          });
          updateRoomForm.resetFields();
          setOpenUpdateRoomModal(false);
        } else {
          openNotification({
            title: updateRoomResData.error.message,
          });
        }
      }
    }
  }, [isUpdatingRoom]);

  useEffect(() => {
    if (deleteRoomReq) {
      setReDeleteRoom({
        value: true,
      });
    }
  }, [deleteRoomReq]);

  useEffect(() => {
    if (!isDeletingRoom) {
      if (deleteRoomResData) {
        if (deleteRoomResData.isSuccess) {
          openNotification({
            title: "Room deleted successfully!",
          });
          setReGetRooms({
            value: true,
          });
        } else {
          openNotification({
            title: deleteRoomResData.error.message,
          });
        }
      }
    }
  }, [isDeletingRoom]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreateRoomModal(true)}
          >
            Create
          </Button>
        </div>

        <div>
          <Input.Search
            placeholder="Type room number..."
            enterButton
            loading={getRoomsReq.name ? isGettingRooms : false}
            onSearch={(value) =>
              setGetRoomsReq({
                ...getRoomsReq,
                roomNumber: value,
              })
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <Table columns={columns} dataSource={tableData[0]} pagination={false} />

        <div className="mt-4 flex justify-center">
          <Pagination
            showQuickJumper
            defaultCurrent={getRoomsReq.page}
            total={tableData[1]}
            pageSize={getRoomsReq.limit}
            onChange={(page) =>
              setGetRoomsReq({
                ...getRoomsReq,
                page,
              })
            }
          />
        </div>
      </div>

      <div>
        {/* Create Room Modal */}
        <Modal
          title="Create Room"
          open={isOpenCreateRoomModal}
          onOk={handleCreateRoomSubmit}
          onCancel={() => setOpenCreateRoomModal(false)}
          width={720}
          footer={[
            <Button key="back" onClick={() => setOpenCreateRoomModal(false)}>
              Cancel
            </Button>,
            <Button key="reset" onClick={() => createRoomForm.resetFields()}>
              Reset
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={isCreatingRoom}
              onClick={handleCreateRoomSubmit}
            >
              Submit
            </Button>,
          ]}
        >
          <Form
            layout="vertical"
            form={createRoomForm}
            name="control-hooks"
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="roomNumber"
              label="Room number"
              rules={[{ required: true }]}
            >
              <Input disabled={isCreatingRoom} />
            </Form.Item>

            <Form.Item
              name="typeId"
              label="Room type"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select a room type..."
                optionFilterProp="label"
                onChange={(value) =>
                  createRoomForm.setFieldValue("typeId", value)
                }
                options={
                  roomTypes?.isSuccess
                    ? roomTypes.data[0].map((roomType) => ({
                        label: roomType.name,
                        value: roomType.id,
                      }))
                    : []
                }
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select a status..."
                optionFilterProp="label"
                onChange={(value) =>
                  createRoomForm.setFieldValue("status", value)
                }
                options={[
                  {
                    value: "inactive",
                    label: "INACTIVE",
                  },
                  {
                    value: "active",
                    label: "ACTIVE",
                  },
                  {
                    value: "under_maintenance",
                    label: "UNDER_MAINTENANCE",
                  },
                  {
                    value: "retired",
                    label: "RETIRED",
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="currentCondition"
              label="Current condition"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select a current condition..."
                optionFilterProp="label"
                onChange={(value) =>
                  createRoomForm.setFieldValue("currentCondition", value)
                }
                options={[
                  {
                    value: "available",
                    label: "AVAILABLE",
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true }]}
            >
              <TextEditor disabled={isCreatingRoom} />
            </Form.Item>

            <Form.Item name="media" label="Media">
              <PictureWall
                onChange={(value) =>
                  createRoomForm.setFieldValue("media", value)
                }
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Update Room Modal */}
        <Modal
          title="Update Room"
          open={isOpenUpdateRoomModal}
          onOk={handleUpdateRoomSubmit}
          onCancel={() => setOpenUpdateRoomModal(false)}
          width={720}
          footer={[
            <Button key="back" onClick={() => setOpenUpdateRoomModal(false)}>
              Cancel
            </Button>,
            <Button key="reset" onClick={() => updateRoomForm.resetFields()}>
              Reset
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={isUpdatingRoom}
              onClick={handleUpdateRoomSubmit}
            >
              Submit
            </Button>,
          ]}
        >
          <Form
            layout="vertical"
            form={updateRoomForm}
            name="control-hooks"
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="roomNumber"
              label="Room number"
              rules={[{ required: true }]}
            >
              <Input disabled={isUpdatingRoom} />
            </Form.Item>

            <Form.Item
              name="typeId"
              label="Room type"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select a room type..."
                optionFilterProp="label"
                onChange={(value) =>
                  createRoomForm.setFieldValue("typeId", value)
                }
                options={
                  roomTypes?.isSuccess
                    ? roomTypes.data[0].map((roomType) => ({
                        label: roomType.name,
                        value: roomType.id,
                      }))
                    : []
                }
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select a status..."
                optionFilterProp="label"
                onChange={(value) =>
                  updateRoomForm.setFieldValue("status", value)
                }
                disabled={selectedRoomToUpdate?.currentCondition === "booked"}
                options={[
                  {
                    value: "inactive",
                    label: "INACTIVE",
                  },
                  {
                    value: "active",
                    label: "ACTIVE",
                  },
                  {
                    value: "under_maintenance",
                    label: "UNDER_MAINTENANCE",
                  },
                  {
                    value: "retired",
                    label: "RETIRED",
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="currentCondition"
              label="Current condition"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select a current condition..."
                optionFilterProp="label"
                onChange={(value) =>
                  updateRoomForm.setFieldValue("currentCondition", value)
                }
                disabled={selectedRoomToUpdate?.currentCondition === "booked"}
                options={[
                  {
                    value: "available",
                    label: "AVAILABLE",
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true }]}
            >
              <TextEditor
                disabled={isUpdatingRoom}
                initialValue={updateRoomForm.getFieldValue("description")}
              />
            </Form.Item>

            <Form.Item name="media" label="Media">
              <PictureWall
                initialValue={
                  updateRoomForm?.getFieldValue("media")?.map((path) => ({
                    name: path.substring(path.lastIndexOf("/") + 1),
                    url: `${import.meta.env.VITE_API_BASE_URL}/${path}`,
                    status: "done",
                  })) ?? []
                }
                onChange={(value) =>
                  updateRoomForm.setFieldValue("media", value)
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      {contextHolder}
    </div>
  );
}
