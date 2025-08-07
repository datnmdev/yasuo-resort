import { Button, Table, Space, Tooltip, Input, Pagination, Modal, Form, InputNumber, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined, LockOutlined } from '@ant-design/icons';
import useFetch from '../../hooks/fetch.hook';
import apis from '../../apis/index';
import { useEffect, useState } from 'react';
import TextEditor from '../../components/TextEditor';
import useToast from '../../hooks/toast.hook';

export default function ServiceManagementPage() {
  const [getServicesReq, setGetServicesReq] = useState({
    page: 1,
    limit: 10,
  });
  const {
    data: services,
    isLoading: isGettingServices,
    setRefetch: setReGetServices,
  } = useFetch(apis.service.getServices, getServicesReq);
  const [tableData, setTableData] = useState([[], 0]);
  const [isOpenCreateServiceModal, setOpenCreateServiceModal] = useState(false);
  const [isOpenUpdateServiceModal, setOpenUpdateServiceModal] = useState(false);
  const [createServiceForm] = Form.useForm();
  const [updateServiceForm] = Form.useForm();
  const [createServiceReq, setCreateServiceReq] = useState(null);
  const [selectedServiceToUpdate, setSelectedServiceToUpdate] = useState(null);
  const [updateServiceReq, setUpdateServiceReq] = useState(null);
  const {
    data: createServiceResData,
    isLoading: isCreatingService,
    setRefetch: setReCreateService,
  } = useFetch(apis.service.createService, createServiceReq, false);
  const {
    data: updateServiceResData,
    isLoading: isUpdatingService,
    setRefetch: setReUpdateService,
  } = useFetch(apis.service.updateService, updateServiceReq, false);
  const { openNotification, contextHolder } = useToast();
  const [deleteServiceReq, setDeleteServiceReq] = useState(null);
  const {
    data: deleteServiceResData,
    isLoading: isDeletingService,
    setRefetch: setReDeleteService,
  } = useFetch(apis.service.deleteService, deleteServiceReq, false);
  const [selectedServiceToPublish, setSelectedServiceToPublish] = useState(null);
  const [selectedServiceToUnpublish, setSelectedServiceToUnpublish] = useState(null);

  const columns = [
    {
      title: 'Id',
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
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        let color;
        switch (record.status) {
          case 'inactive':
            color = 'gray';
            break;
          case 'active':
            color = 'green';
            break;
        }

        return <Tag color={color}>{record.status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
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
          {record.status === 'inactive' && (
            <Tooltip title="Publish">
              <Button
                shape="circle"
                icon={<GlobalOutlined />}
                onClick={() =>
                  setSelectedServiceToPublish(services?.data?.[0]?.find((item) => item.id === record.id) ?? null)
                }
                loading={selectedServiceToPublish?.id === record.id && isUpdatingService}
              />
            </Tooltip>
          )}

          {record.status === 'active' && (
            <Tooltip title="Unpublish">
              <Button
                shape="circle"
                icon={<LockOutlined />}
                onClick={() =>
                  setSelectedServiceToUnpublish(services?.data?.[0]?.find((item) => item.id === record.id) ?? null)
                }
                loading={selectedServiceToUnpublish?.id === record.id && isUpdatingService}
              />
            </Tooltip>
          )}

          <Tooltip title="Edit">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() =>
                setSelectedServiceToUpdate(services?.data?.[0]?.find((item) => item.id === record.id) ?? null)
              }
              loading={selectedServiceToUpdate?.id === record.id && isUpdatingService}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() =>
                setDeleteServiceReq({
                  serviceId: record.id,
                })
              }
              loading={deleteServiceReq?.serviceId === record.id && isDeletingService}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  async function handleCreateServiceSubmit() {
    try {
      const values = await createServiceForm.validateFields();
      setCreateServiceReq(values);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleUpdateServiceSubmit() {
    try {
      const values = await updateServiceForm.validateFields();
      setUpdateServiceReq({
        param: {
          serviceId: selectedServiceToUpdate?.id,
        },
        body: values,
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setReGetServices({
      value: true,
    });
  }, [getServicesReq]);

  useEffect(() => {
    if (!isGettingServices) {
      if (services && services.isSuccess) {
        setTableData([
          services.data[0].map((service) => ({
            key: service.id,
            id: service.id,
            name: service.name,
            status: service.status,
            price: `${service.price}`,
            description: service.description,
          })),
          services.data[1],
        ]);
      }
    }
  }, [isGettingServices]);

  useEffect(() => {
    if (createServiceReq) {
      setReCreateService({
        value: true,
      });
    }
  }, [createServiceReq]);

  useEffect(() => {
    if (updateServiceReq) {
      setReUpdateService({
        value: true,
      });
    }
  }, [updateServiceReq]);

  useEffect(() => {
    if (!isCreatingService) {
      if (createServiceResData) {
        if (createServiceResData.isSuccess) {
          openNotification({
            title: 'Service created successfully!',
          });
          setReGetServices({
            value: true,
          });
          createServiceForm.resetFields();
          setOpenCreateServiceModal(false);
        } else {
          openNotification({
            title: createServiceResData.error.message,
          });
        }
      }
    }
  }, [isCreatingService]);

  useEffect(() => {
    if (selectedServiceToUpdate) {
      updateServiceForm.setFieldsValue(selectedServiceToUpdate);
      setOpenUpdateServiceModal(true);
    }
  }, [selectedServiceToUpdate]);

  useEffect(() => {
    if (!isUpdatingService) {
      if (updateServiceResData) {
        if (updateServiceResData.isSuccess) {
          openNotification({
            title: 'Service updated successfully!',
          });
          setReGetServices({
            value: true,
          });
          updateServiceForm.resetFields();
          setOpenUpdateServiceModal(false);
        } else {
          openNotification({
            title: updateServiceResData.error.message,
          });
        }
      }
    }
  }, [isUpdatingService]);

  useEffect(() => {
    if (deleteServiceReq) {
      setReDeleteService({
        value: true,
      });
    }
  }, [deleteServiceReq]);

  useEffect(() => {
    if (!isDeletingService) {
      if (deleteServiceResData) {
        if (deleteServiceResData.isSuccess) {
          openNotification({
            title: 'Service deleted successfully!',
          });
          setReGetServices({
            value: true,
          });
        } else {
          openNotification({
            title: deleteServiceResData.error.message,
          });
        }
      }
    }
  }, [isDeletingService]);

  useEffect(() => {
    if (selectedServiceToPublish) {
      setUpdateServiceReq({
        param: {
          serviceId: selectedServiceToPublish.id,
        },
        body: {
          status: 'active',
        },
      });
      setSelectedServiceToPublish(null);
    }
  }, [selectedServiceToPublish]);

  useEffect(() => {
    if (selectedServiceToUnpublish) {
      setUpdateServiceReq({
        param: {
          serviceId: selectedServiceToUnpublish.id,
        },
        body: {
          status: 'inactive',
        },
      });
      setSelectedServiceToUnpublish(null);
    }
  }, [selectedServiceToUnpublish]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreateServiceModal(true)}>
            Create
          </Button>
        </div>

        <div>
          <Input.Search
            placeholder="Type id or name..."
            enterButton
            loading={getServicesReq.name ? isGettingServices : false}
            onSearch={(value) =>
              setGetServicesReq({
                ...getServicesReq,
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
            defaultCurrent={getServicesReq.page}
            total={tableData[1]}
            pageSize={getServicesReq.limit}
            onChange={(page) =>
              setGetServicesReq({
                ...getServicesReq,
                page,
              })
            }
          />
        </div>
      </div>

      <div>
        {/* Create Service Modal */}
        <Modal
          title="Create Service"
          open={isOpenCreateServiceModal}
          onOk={handleCreateServiceSubmit}
          onCancel={() => setOpenCreateServiceModal(false)}
          width={720}
          footer={[
            <Button key="back" onClick={() => setOpenCreateServiceModal(false)}>
              Cancel
            </Button>,
            <Button key="reset" onClick={() => createServiceForm.resetFields()}>
              Reset
            </Button>,
            <Button key="submit" type="primary" loading={isCreatingService} onClick={handleCreateServiceSubmit}>
              Submit
            </Button>,
          ]}
        >
          <Form layout="vertical" form={createServiceForm} name="control-hooks" style={{ marginTop: 16 }}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input disabled={isCreatingService} />
            </Form.Item>

            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
              <InputNumber
                addonAfter="$"
                defaultValue={0.0}
                min={0.0}
                step={0.01}
                stringMode
                style={{ width: '100%' }}
                disabled={isCreatingService}
              />
            </Form.Item>

            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <TextEditor disabled={isCreatingService} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Update Service Modal */}
        <Modal
          title="Update Service"
          open={isOpenUpdateServiceModal}
          onOk={handleUpdateServiceSubmit}
          onCancel={() => setOpenUpdateServiceModal(false)}
          width={720}
          footer={[
            <Button key="back" onClick={() => setOpenUpdateServiceModal(false)}>
              Cancel
            </Button>,
            <Button key="reset" onClick={() => updateServiceForm.resetFields()}>
              Reset
            </Button>,
            <Button key="submit" type="primary" loading={isUpdatingService} onClick={handleUpdateServiceSubmit}>
              Submit
            </Button>,
          ]}
        >
          <Form
            layout="vertical"
            form={updateServiceForm}
            initialValues={selectedServiceToUpdate}
            name="control-hooks"
            style={{ marginTop: 16 }}
          >
            <Form.Item name="id" label="Id">
              <Input disabled />
            </Form.Item>

            <Form.Item name="name" label="Name">
              <Input disabled={isUpdatingService} />
            </Form.Item>

            <Form.Item name="status" label="Status">
              <Input disabled />
            </Form.Item>

            <Form.Item name="price" label="Price">
              <InputNumber
                addonAfter="$"
                min={0.0}
                step={0.01}
                stringMode
                style={{ width: '100%' }}
                disabled={isUpdatingService}
              />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextEditor disabled={isUpdatingService} initialValue={updateServiceForm.getFieldValue('description')} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      {contextHolder}
    </div>
  );
}
