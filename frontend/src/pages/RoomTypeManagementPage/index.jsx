import {
  Button,
  Table,
  Space,
  Tooltip,
  Input,
  Pagination,
  Modal,
  Form,
  InputNumber,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import useFetch from "../../hooks/fetch.hook";
import apis from "../../apis/index";
import { useEffect, useState } from "react";
import TextEditor from "../../components/TextEditor";
import useToast from "../../hooks/toast.hook";

export default function RoomTypeManagementPage() {
  const [getRoomTypesReq, setGetRoomTypesReq] = useState({
    page: 1,
    limit: 10,
  });
  const {
    data: roomTypes,
    isLoading: isGettingRoomTypes,
    setRefetch: setReGetRoomTypes,
  } = useFetch(apis.roomType.getRoomTypes, getRoomTypesReq);
  const [tableData, setTableData] = useState([[], 0]);
  const [isOpenCreateRoomTypeModal, setOpenCreateRoomTypeModal] =
    useState(false);
  const [isOpenUpdateRoomTypeModal, setOpenUpdateRoomTypeModal] =
    useState(false);
  const [createRoomTypeForm] = Form.useForm();
  const [updateRoomTypeForm] = Form.useForm();
  const [createRoomTypeReq, setCreateRoomTypeReq] = useState(null);
  const [selectedRoomTypeToUpdate, setSelectedRoomTypeToUpdate] =
    useState(null);
  const [updateRoomTypeReq, setUpdateRoomTypeReq] = useState(null);
  const {
    data: createRoomTypeResData,
    isLoading: isCreatingRoomType,
    setRefetch: setReCreateRoomType,
  } = useFetch(apis.roomType.createRoomType, createRoomTypeReq, false);
  const {
    data: updateRoomTypeResData,
    isLoading: isUpdatingRoomType,
    setRefetch: setReUpdateRoomType,
  } = useFetch(apis.roomType.updateRoomType, updateRoomTypeReq, false);
  const { openNotification, contextHolder } = useToast();
  const [deleteRoomTypeReq, setDeleteRoomTypeReq] = useState(null);
  const {
    data: deleteRoomTypeResData,
    isLoading: isDeletingRoomType,
    setRefetch: setReDeleteRoomType,
  } = useFetch(apis.roomType.deleteRoomType, deleteRoomTypeReq, false);

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Min Price",
      dataIndex: "minPrice",
      key: "minPrice",
    },
    {
      title: "Max Price",
      dataIndex: "maxPrice",
      key: "maxPrice",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (htmlText) => (
        <div dangerouslySetInnerHTML={{ __html: htmlText }}></div>
      ),
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
              onClick={() =>
                setSelectedRoomTypeToUpdate(
                  roomTypes?.data?.[0]?.find((item) => item.id === record.id) ??
                    null
                )
              }
              loading={
                selectedRoomTypeToUpdate?.id === record.id && isUpdatingRoomType
              }
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() =>
                setDeleteRoomTypeReq({
                  roomTypeId: record.id,
                })
              }
              loading={
                deleteRoomTypeReq?.roomTypeId === record.id &&
                isDeletingRoomType
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  async function handleCreateRoomTypeSubmit() {
    try {
      const values = await createRoomTypeForm.validateFields();
      setCreateRoomTypeReq(values);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleUpdateRoomTypeSubmit() {
    try {
      const values = await updateRoomTypeForm.validateFields();
      setUpdateRoomTypeReq({
        param: {
          roomTypeId: selectedRoomTypeToUpdate?.id,
        },
        body: values,
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setReGetRoomTypes({
      value: true,
    });
  }, [getRoomTypesReq]);

  useEffect(() => {
    if (!isGettingRoomTypes) {
      if (roomTypes && roomTypes.isSuccess) {
        setTableData([
          roomTypes.data[0].map((roomType) => ({
            key: roomType.id,
            id: roomType.id,
            name: roomType.name,
            minPrice: `$${roomType.minPrice}`,
            maxPrice: `$${roomType.maxPrice}`,
            description: roomType.description,
          })),
          roomTypes.data[1],
        ]);
      }
    }
  }, [isGettingRoomTypes]);

  useEffect(() => {
    if (createRoomTypeReq) {
      setReCreateRoomType({
        value: true,
      });
    }
  }, [createRoomTypeReq]);

  useEffect(() => {
    if (updateRoomTypeReq) {
      setReUpdateRoomType({
        value: true,
      });
    }
  }, [updateRoomTypeReq]);

  useEffect(() => {
    if (!isCreatingRoomType) {
      if (createRoomTypeResData) {
        if (createRoomTypeResData.isSuccess) {
          openNotification({
            title: "Room type created successfully!",
          });
          setReGetRoomTypes({
            value: true,
          });
          createRoomTypeForm.resetFields();
          setOpenCreateRoomTypeModal(false);
        } else {
          openNotification({
            title: createRoomTypeResData.error.message,
          });
        }
      }
    }
  }, [isCreatingRoomType]);

  useEffect(() => {
    if (selectedRoomTypeToUpdate) {
      updateRoomTypeForm.setFieldsValue(selectedRoomTypeToUpdate);
      setOpenUpdateRoomTypeModal(true);
    }
  }, [selectedRoomTypeToUpdate]);

  useEffect(() => {
    if (!isUpdatingRoomType) {
      if (updateRoomTypeResData) {
        if (updateRoomTypeResData.isSuccess) {
          openNotification({
            title: "Room type updated successfully!",
          });
          setReGetRoomTypes({
            value: true,
          });
          updateRoomTypeForm.resetFields();
          setOpenUpdateRoomTypeModal(false);
        } else {
          openNotification({
            title: updateRoomTypeResData.error.message,
          });
        }
      }
    }
  }, [isUpdatingRoomType]);

  useEffect(() => {
    if (deleteRoomTypeReq) {
      setReDeleteRoomType({
        value: true,
      });
    }
  }, [deleteRoomTypeReq]);

  useEffect(() => {
    if (!isDeletingRoomType) {
      if (deleteRoomTypeResData) {
        if (deleteRoomTypeResData.isSuccess) {
          openNotification({
            title: "Room type deleted successfully!",
          });
          setReGetRoomTypes({
            value: true,
          });
        } else {
          openNotification({
            title: deleteRoomTypeResData.error.message,
          });
        }
      }
    }
  }, [isDeletingRoomType]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreateRoomTypeModal(true)}
          >
            Create
          </Button>
        </div>

        <div>
          <Input.Search
            placeholder="Type id or name..."
            enterButton
            loading={getRoomTypesReq.name ? isGettingRoomTypes : false}
            onSearch={(value) =>
              setGetRoomTypesReq({
                ...getRoomTypesReq,
                keyword: value,
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
            defaultCurrent={getRoomTypesReq.page}
            total={tableData[1]}
            pageSize={getRoomTypesReq.limit}
            onChange={(page) =>
              setGetRoomTypesReq({
                ...getRoomTypesReq,
                page,
              })
            }
          />
        </div>
      </div>

      <div>
        {/* Create Room Type Modal */}
        <Modal
          title="Create Room Type"
          open={isOpenCreateRoomTypeModal}
          onOk={handleCreateRoomTypeSubmit}
          onCancel={() => setOpenCreateRoomTypeModal(false)}
          width={720}
          footer={[
            <Button
              key="back"
              onClick={() => setOpenCreateRoomTypeModal(false)}
            >
              Cancel
            </Button>,
            <Button
              key="reset"
              onClick={() => createRoomTypeForm.resetFields()}
            >
              Reset
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={isCreatingRoomType}
              onClick={handleCreateRoomTypeSubmit}
            >
              Submit
            </Button>,
          ]}
        >
          <Form
            layout="vertical"
            form={createRoomTypeForm}
            name="control-hooks"
            style={{ marginTop: 16 }}
          >
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input disabled={isCreatingRoomType} />
            </Form.Item>

            <Form.Item
              name="minPrice"
              label="Min Price"
              rules={[{ required: true }]}
            >
              <InputNumber
                addonAfter="$"
                defaultValue={0.0}
                min={0.0}
                step={0.01}
                stringMode
                style={{ width: "100%" }}
                disabled={isCreatingRoomType}
              />
            </Form.Item>

            <Form.Item
              name="maxPrice"
              label="Max Price"
              rules={[{ required: true }]}
            >
              <InputNumber
                addonAfter="$"
                defaultValue={0.0}
                min={0.0}
                step={0.01}
                stringMode
                style={{ width: "100%" }}
                disabled={isCreatingRoomType}
              />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextEditor disabled={isCreatingRoomType} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Update Room Type Modal */}
        <Modal
          title="Update Room Type"
          open={isOpenUpdateRoomTypeModal}
          onOk={handleUpdateRoomTypeSubmit}
          onCancel={() => setOpenUpdateRoomTypeModal(false)}
          width={720}
          footer={[
            <Button
              key="back"
              onClick={() => setOpenUpdateRoomTypeModal(false)}
            >
              Cancel
            </Button>,
            <Button
              key="reset"
              onClick={() => updateRoomTypeForm.resetFields()}
            >
              Reset
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={isUpdatingRoomType}
              onClick={handleUpdateRoomTypeSubmit}
            >
              Submit
            </Button>,
          ]}
        >
          <Form
            layout="vertical"
            form={updateRoomTypeForm}
            initialValues={selectedRoomTypeToUpdate}
            name="control-hooks"
            style={{ marginTop: 16 }}
          >
            <Form.Item name="id" label="Id">
              <Input disabled />
            </Form.Item>

            <Form.Item name="name" label="Name">
              <Input disabled={isUpdatingRoomType} />
            </Form.Item>

            <Form.Item
              name="minPrice"
              label="Min Price"
              rules={[{ required: true }]}
            >
              <InputNumber
                addonAfter="$"
                defaultValue={0.0}
                min={0.0}
                step={0.01}
                stringMode
                style={{ width: "100%" }}
                disabled={isCreatingRoomType}
              />
            </Form.Item>

            <Form.Item
              name="maxPrice"
              label="Max Price"
              rules={[{ required: true }]}
            >
              <InputNumber
                addonAfter="$"
                defaultValue={0.0}
                min={0.0}
                step={0.01}
                stringMode
                style={{ width: "100%" }}
                disabled={isCreatingRoomType}
              />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextEditor
                disabled={isUpdatingRoomType}
                initialValue={updateRoomTypeForm.getFieldValue("description")}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      {contextHolder}
    </div>
  );
}
