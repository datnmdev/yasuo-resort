import React, { useState } from "react";
import { Drawer, Button as ButtonAnt } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from '@ui/button';
import RecommendRoomList from "./RecommendRoomList";

const RecommendRoom = () => {
    const [openRecommendDrawer, setOpenRecommendDrawer] = useState(false);
    return (
        <>
            {/* Nút mở side panel - sticky bên trái */}
            {!openRecommendDrawer && (
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white p-4 mt-4"
                    onClick={() => setOpenRecommendDrawer(true)}
                >
                    ReCommend Room
                    <RightOutlined />
                </Button>
            )}

            {/* Drawer bên trái */}
            <Drawer
                title="Recommend Room"
                placement="left"
                open={openRecommendDrawer}
                onClose={() => setOpenRecommendDrawer(false)}
                width={900}
            >
                <RecommendRoomList />

                {/* Nút đóng bên trong */}
                <ButtonAnt onClick={() => setOpenRecommendDrawer(false)}>
                    <LeftOutlined /> Close
                </ButtonAnt>
            </Drawer>
        </>
    )
}

export default RecommendRoom