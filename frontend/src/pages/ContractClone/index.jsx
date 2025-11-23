import React, { useEffect, useState } from 'react'
import apis from '@apis/index'
import useFetch from '@src/hooks/fetch.hook'
import { useSelector } from 'react-redux';
import { userSelector } from '@src/stores/reducers/userReducer';
import { Card, Avatar, Descriptions, Button, Tag, Upload, Input, Tabs } from 'antd';
import {
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  HomeOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  UserOutlined,
  GiftOutlined
} from '@ant-design/icons';
import ContractWithStatus from './ContractWithStatus';

const Contract = () => {

  const user = useSelector(userSelector.selectUser);

  const [listBookingFilterByUserId, setListBookingFilterByUserId] = useState([])

  const { data: listBookingFromApi, loading, error } = useFetch(() =>
    apis.booking.getBookings({ page: 1, limit: 1000 })
  );

  useEffect(() => {
    setListBookingFilterByUserId(listBookingFromApi?.data[0].filter(item => item.userId === user.id))
  }, [listBookingFromApi])

  return (
    <>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Contract</h1>
        <Tabs
          defaultActiveKey="Pending"
          items={[
            {
              key: 'Pending',
              label: (
                <span className="text-teal-600 text-xl">
                  Pending
                </span>
              ),
              children: <>
                <ContractWithStatus status="pending" data={listBookingFilterByUserId} />
              </>
            },
            {
              key: 'Confirmed',
              label: (
                <span className="text-teal-600 text-xl">
                  Confirmed
                </span>
              ),
              children: <>
                <ContractWithStatus status="confirmed" data={listBookingFilterByUserId} />
              </>
            },
            {
              key: 'Rejected',
              label: (
                <span className="text-teal-600 text-xl">
                  Rejected
                </span>
              ),
              children: <>
                <ContractWithStatus status="rejected" data={listBookingFilterByUserId} />
              </>
            },
            {
              key: 'Cancelled',
              label: (
                <span className="text-teal-600 text-xl">
                  Cancelled
                </span>
              ),
              children: <>
                <ContractWithStatus status="cancelled" data={listBookingFilterByUserId} />
              </>
            },
          ]}
          className="custom-tabs"
        />
      </div>
    </>
  )
}

export default Contract