import React, { useMemo, useState } from 'react'
import useFetch from '@src/hooks/fetch.hook'
import apis from '@apis/index'
import { Image, Skeleton, Carousel, Button } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'

const baseUrl = import.meta.env.VITE_API_BASE_URL

const ContractRoomImg = ({ data }) => {
    const [previewVisible, setPreviewVisible] = useState(false);

    const { data: roomlist, loading } = useFetch(() => apis.room.getRooms({ page: 1, limit: 1000 }))

    const room = useMemo(() => {
        if (!roomlist?.data?.[0]?.length) return null
        return roomlist.data[0].find(room => room.id === data)
    }, [roomlist, data])

    if (loading) {
        return (
            <div className="w-[200px] h-[200px]">
                <Skeleton.Image active className="w-full h-full" />
            </div>
        )
    }

    if (!room?.media?.length) {
        return (
            <div className="relative w-[200px] h-[200px]">
                <Image
                    width={200}
                    height={200}
                    className="rounded-xl border-1 object-cover"
                    src={`${baseUrl}/default-room.jpg`}
                    alt="Default Room"
                />
                {room?.roomNumber && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {room.roomNumber}
                    </div>
                )}
            </div>
        )
    }
    return (
        <div className="relative w-[200px]">
            <Carousel
                dots={true}
                arrows={true}
                prevArrow={<LeftOutlined className="text-white text-lg" />}
                nextArrow={<RightOutlined className="text-white text-lg" />}
                className="rounded-xl overflow-hidden"
                dotPosition="bottom"
            >
                {room.media.map((media, index) => (
                    <div key={index} className="relative">
                        <Image
                            width={200}
                            height={200}
                            className="object-cover"
                            src={`${baseUrl}/${media.path}`}
                            alt={`Room ${room.roomNumber || ''} - ${index + 1}`}
                            preview={{
                                visible: previewVisible,
                                onVisibleChange: (vis) => setPreviewVisible(vis),
                                mask: (
                                    <div className="custom-preview-mask">
                                        <span className="text-white">Press ESC to exit</span>
                                    </div>
                                )
                            }}
                            onClick={() => setPreviewVisible(true)}
                        />
                    </div>
                ))}
            </Carousel>
        </div>
    )
}

export default ContractRoomImg