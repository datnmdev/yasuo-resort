import apis from '@apis/index';
import useFetch from '@src/hooks/fetch.hook';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DollarCircleOutlined, FileOutlined, RiseOutlined } from '@ant-design/icons';
import CountUp from 'react-countup';

export default function StatisticsChart() {
  const [getStatisticRevenueReq, setGetStatisticsRevenueReq] = useState({
    timeUnit: 'month',
    startDate: moment().startOf('year').format('YYYY-MM-DD'),
    endDate: moment().endOf('year').format('YYYY-MM-DD'),
  });
  const {
    data: statisticsRevenueData,
    isLoading: isGettingStatisticsRevenueData,
    setRefetch: setReGetStatisticsRevenueData,
  } = useFetch(apis.statistics.getStatisticRevenueData, getStatisticRevenueReq);
  const [data, setData] = useState([]);
  const [form] = Form.useForm();
  const [topRooms, setTopRooms] = useState([]);

  async function handleSubmit() {
    try {
      await form.validateFields();
      setReGetStatisticsRevenueData({
        value: true,
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!isGettingStatisticsRevenueData && statisticsRevenueData) {
      if (statisticsRevenueData.isSuccess) {
        setTopRooms(
          statisticsRevenueData.data
            .reduce((acc, curr) => {
              for (const room of curr.rooms) {
                const existedItemIndex = acc.findIndex((item) => item.info.id === room.info.id);
                if (existedItemIndex !== -1) {
                  acc[existedItemIndex].expectedRevenue = (
                    Number(acc[existedItemIndex].expectedRevenue) + Number(room.expectedRevenue)
                  ).toFixed(2);
                  acc[existedItemIndex].actualRevenue = (
                    Number(acc[existedItemIndex].actualRevenue) + Number(room.actualRevenue)
                  ).toFixed(2);
                } else {
                  acc.push(room);
                }
              }
              return acc;
            }, [])
            .sort((a, b) => Number(b.expectedRevenue) - Number(a.expectedRevenue))
        );
        setData(
          statisticsRevenueData.data.map((item) => ({
            name: item.label,
            expectedRevenue: item.expectedRevenue,
            actualRevenue: item.actualRevenue,
          }))
        );
      }
    }
  }, [isGettingStatisticsRevenueData, statisticsRevenueData]);

  useEffect(() => {
    form.setFieldsValue({
      timeUnit: getStatisticRevenueReq.timeUnit,
      startDate: dayjs(getStatisticRevenueReq.startDate),
      endDate: dayjs(getStatisticRevenueReq.endDate),
    });
  }, [getStatisticRevenueReq]);

  return (
    <div className="space-y-4">
      <div className="mt-4">
        <Form name="layout-multiple-horizontal" layout="inline" form={form}>
          <Form.Item name="timeUnit" label="Unit of time" rules={[{ required: true }]}>
            <Select
              style={{
                width: 84,
              }}
              defaultValue={getStatisticRevenueReq.timeUnit}
              options={[
                {
                  label: 'Date',
                  value: 'date',
                },
                {
                  label: 'Month',
                  value: 'month',
                },
                {
                  label: 'Year',
                  value: 'year',
                },
              ]}
              onChange={(value) => {
                form.setFieldValue('timeUnit', value);
                setGetStatisticsRevenueReq((prev) => ({ ...prev, timeUnit: value }));
              }}
            />
          </Form.Item>

          <Form.Item name="startDate" label="From date" rules={[{ required: true }]}>
            <DatePicker
              picker={getStatisticRevenueReq.timeUnit}
              onChange={(value) => {
                form.setFieldValue('startDate', value);
                setGetStatisticsRevenueReq((prev) => ({ ...prev, startDate: value.format('YYYY-MM-DD') }));
              }}
            />
          </Form.Item>

          <Form.Item name="endDate" label="To date" rules={[{ required: true }]}>
            <DatePicker
              picker={getStatisticRevenueReq.timeUnit}
              onChange={(value) => {
                form.setFieldValue('endDate', value);
                setGetStatisticsRevenueReq((prev) => ({ ...prev, endDate: value.format('YYYY-MM-DD') }));
              }}
            />
          </Form.Item>

          <Form.Item label="">
            <Button color="cyan" variant="solid" onClick={handleSubmit}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-start space-x-4">
          <div className="p-4 rounded-md shadow-[0_0_8px_rgba(0,0,0,0.2)] flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-[#0E584C] flex justify-center items-center">
              <RiseOutlined
                style={{
                  fontSize: 24,
                  color: '#fff',
                }}
              />
            </div>
            <div className="grow">
              <h4>Total Expected Revenue</h4>
              <div className="mt-1 text-[1.4rem]">
                {
                  <CountUp
                    end={
                      statisticsRevenueData?.isSuccess
                        ? statisticsRevenueData.data.reduce((acc, curr) => acc + Number(curr.expectedRevenue), 0)
                        : 0
                    }
                    duration={2}
                    prefix="$"
                    separator=","
                    decimals="2"
                  />
                }
              </div>
            </div>
          </div>
          <div className="p-4 rounded-md shadow-[0_0_8px_rgba(0,0,0,0.2)] flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-[#0E584C] flex justify-center items-center">
              <DollarCircleOutlined
                style={{
                  fontSize: 24,
                  color: '#fff',
                }}
              />
            </div>
            <div className="grow">
              <h4>Total Actual Revenue</h4>
              <div className="mt-1 text-[1.4rem]">
                {
                  <CountUp
                    end={
                      statisticsRevenueData?.isSuccess
                        ? statisticsRevenueData.data.reduce((acc, curr) => acc + Number(curr.actualRevenue), 0)
                        : 0
                    }
                    duration={2}
                    prefix="$"
                    separator=","
                    decimals="2"
                  />
                }
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <ResponsiveContainer width="80%" aspect={1.618}>
            <LineChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 10 }}>
              <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
              <XAxis dataKey="name" />
              <YAxis width={60} label={{ value: 'USD', position: 'insideLeft', angle: -90 }} />
              <Legend align="right" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="expectedRevenue"
                stroke="#4e79a7"
                strokeWidth={2}
                name="Expected Revenue"
              />
              <Line type="monotone" dataKey="actualRevenue" stroke="#e15759" strokeWidth={2} name="Actual Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-[1.6rem] font-semibold text-[#0A504E]">Top-performing rooms by expected revenue</h3>
          <ul className="mt-2">
            {topRooms.length > 0 ? (
              topRooms.map((room, index) => {
                let strokeColor;
                switch (index) {
                  case 0:
                    strokeColor = '#4a90e2';
                    break;

                  case 1:
                    strokeColor = '#25be9c';
                    break;

                  case 2:
                    strokeColor = '#ff0000';
                    break;

                  default:
                    strokeColor = '#000';
                    break;
                }
                return (
                  <li
                    key={room.info.id}
                    className="group flex justify-between items-center shadow-[0_0_8px_rgba(0,0,0,0.1)] hover:bg-[rgb(14,88,76)] transition-colors duration-300 p-4 rounded-md"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="text-[2rem] text-transparent text-shadow-[0_0_16px_rgba(255,255,255)]"
                        style={{
                          WebkitTextStrokeWidth: '2px',
                          WebkitTextStrokeColor: strokeColor,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-4">
                        <img
                          className="w-12 h-12 object-cover object-center rounded-md"
                          src={import.meta.env.VITE_API_BASE_URL.concat('/', room.info.media?.[0]?.path)}
                          alt={room.info.roomNumber}
                        />
                        <div className="group-hover:text-white transition-colors duration-300">
                          <h3>{room.info.roomNumber}</h3>
                          <div className="italic opacity-60">Type: {room.info.type.name}</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-x-4">
                      <span className="text-[#4e79a7] group-hover:text-white transition-colors duration-300">
                        Expected: <span className="font-bold">${room.expectedRevenue.toLocaleString()}</span>
                      </span>
                      <span className="text-[#e15759] group-hover:text-white transition-colors duration-300">
                        Actual: <span className="font-bold">${room.actualRevenue.toLocaleString()}</span>
                      </span>
                    </div>
                  </li>
                );
              })
            ) : (
              <div className="flex justify-center items-center italic opacity-60 p-4 space-x-1.5">
                <FileOutlined style={{ fontSize: 24, color: '#999' }} />
                <span>No available data</span>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
