import React, { useEffect, useState } from "react";
import { Card, Image, Spin, Tag, Pagination } from "antd";
import { RightOutlined } from "@ant-design/icons";
import useFetch from "@src/hooks/fetch.hook";
import apis from "@apis/index";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const RecommendRoomList = () => {
    const [rooms, setRooms] = useState([])

    const { data } = useFetch(() => apis.room.getRecommendRoom({ page: 1, limit: Number.MAX_SAFE_INTEGER }));

    useEffect(() => {
        setRooms(data?.data?.[0] || [])
    }, [data])

    console.log("kiểm tra danh sách phòng gợi ý", data)

    return (
        <div className="p-4">
            {/* List Room */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map((room) => (
                    <Card
                        key={room.id}
                        hoverable
                        className="rounded-xl shadow-md border border-gray-100"
                        cover={
                            <Image
                                src={`${baseUrl}/${room.media[0]?.path || 'placeholder.svg'}`}
                                height={200}
                                className="object-cover w-full rounded-t-xl"
                                fallback="https://via.placeholder.com/300x200?text=No+Image"
                            />
                        }
                    >
                        <h2 className="text-lg font-semibold">{room.roomNumber}</h2>

                        <p className="text-gray-500 mb-2">
                            Type: <span className="font-medium">{room.type?.name}</span>
                        </p>

                        <Tag color="green">
                            Price: ${room.price}
                        </Tag>
                        <Tag color="blue">
                            Max people: {room.maxPeople}
                        </Tag>

                        <div
                            className="mt-3 text-gray-600 text-sm"
                            dangerouslySetInnerHTML={{ __html: room.description }}
                        ></div>
                    </Card>
                ))}
            </div>
        </div>
    );
};




export default RecommendRoomList;
