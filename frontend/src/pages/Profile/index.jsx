import React, { useEffect, useState } from 'react'
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
import user from '@apis/user';
import upload from '@apis/upload';
import FavoriteRoom from '../FavoriteRoom/FavoriteRoom';
import FavoriteService from '../FavoriteService/FavoriteService';
import VoucherUser from '../VoucherUser';

const Profile = () => {

    const [userInfo, setuserInfo] = useState({});

    const [dataUpdate, setDataUpdate] = useState({})


    const genderTag = {
        male: <Tag color="blue"><ManOutlined /> Male</Tag>,
        female: <Tag color="magenta"><WomanOutlined /> Female</Tag>,
        other: <Tag color="purple"><UserOutlined /> Other</Tag>,
    };

    const getProfile = async () => {
        try {
            const res = await user.getProfile();
            const userData = res?.data?.data || {};
            setuserInfo(userData);
            setDataUpdate({ ...dataUpdate, avatar: userData.avatar, phone: userData.phone })
        } catch (error) {
            console.error("Lỗi lấy profile:", error);
        }
    };

    const handleSaveInfo = async () => {
        try {
            const res = await user.updateProfile(dataUpdate);
            window.location.reload();
        } catch (error) {
            console.error("Lỗi cập nhật thông tin:", error);
        }
    }

    const handleUploadAvatar = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadRes = await upload.uploadFile(formData);
            const path = uploadRes.data?.path?.replace(/\\/g, "/");
            if (path) {
                setuserInfo({ ...userInfo, avatar: path })
                setDataUpdate({ ...dataUpdate, avatar: path })
            } else {
                alert("Upload thất bại!");
            }
        } catch (error) {
            console.error("Lỗi upload avatar:", error);
        }

        return false; // Ngăn Ant Design Upload tự động upload
    }

    useEffect(() => { getProfile() }, [])
    useEffect(() => { }, [userInfo])
    return (
        <div className="flex gap-6 p-3 bg-gray-50 justify-between">
            <div>
                {/* thông tin cá nhân */}
                <Card
                    className="flex-shrink-0"
                    style={{ width: 500, height: "auto" }}
                    cover={<div className="h-30 bg-blue-500 rounded-t-md" style={{ backgroundColor: "rgba(13, 88, 77, 0.7)" }}></div>}
                    actions={[
                        <Button
                            type="primary"
                            onClick={handleSaveInfo}
                            style={{ backgroundColor: 'rgba(13, 88, 77, 0.7)', borderColor: 'rgba(13, 88, 77, 0.7)' }}
                        >
                            Save
                        </Button>
                    ]}
                >
                    <Upload
                        showUploadList={false}
                        beforeUpload={handleUploadAvatar}
                    >
                        <div className="flex justify-center -mt-30 mb-4 cursor-pointer">
                            <Avatar
                                size={120}
                                src={userInfo?.avatar ? `${import.meta.env.VITE_API_BASE_URL}/${userInfo.avatar}` : undefined}
                                style={{ border: "2px solid white" }}
                            />
                        </div>
                    </Upload>

                    <Descriptions
                        title="Persional Infomation"
                        column={1}
                        bordered
                    >
                        <Descriptions.Item label="Full name">{userInfo.name}</Descriptions.Item>

                        <Descriptions.Item label="ID card">
                            <IdcardOutlined className="mr-2" />
                            {userInfo.cccd}
                        </Descriptions.Item>

                        <Descriptions.Item label="Issued date / Place">
                            {userInfo.identityIssuedAt} - {userInfo.identityIssuedPlace}
                        </Descriptions.Item>

                        <Descriptions.Item label="Date of birth">
                            <CalendarOutlined className="mr-2" />
                            {userInfo.dob}
                        </Descriptions.Item>

                        <Descriptions.Item label="Gender">
                            {genderTag[userInfo.gender]}
                        </Descriptions.Item>

                        <Descriptions.Item label="Email">
                            <MailOutlined className="mr-2" />
                            {userInfo.email}
                        </Descriptions.Item>

                        <Descriptions.Item label="Phone number">
                            <PhoneOutlined className="mr-2" />
                            <Input
                                value={dataUpdate.phone}
                                onChange={(e) => setDataUpdate({ ...dataUpdate, phone: e.target.value })}
                                style={{ maxWidth: 200 }}
                            />
                        </Descriptions.Item>

                        <Descriptions.Item label="Permanent address">
                            <HomeOutlined className="mr-2" />
                            {userInfo.permanentAddress}
                        </Descriptions.Item>

                        <Descriptions.Item label="Role">
                            <Tag color={userInfo.role === 'admin' ? 'red' : 'blue'}>
                                {userInfo.role === 'admin' ? 'Admin' : 'User'}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Account status">
                            <Tag color={userInfo.status === 'active' ? 'green' : 'volcano'}>
                                {userInfo.status === 'active' ? 'Active' : 'Inactive'}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </div>
            <div className="flex-1">
                <Tabs
                    defaultActiveKey="rooms"
                    items={[
                        {
                            key: 'rooms',
                            label: (
                                <span>
                                    <HomeOutlined />
                                    Favorite Room
                                </span>
                            ),
                            children: <FavoriteRoom />
                        },
                        {
                            key: 'services',
                            label: (
                                <span>
                                    <GiftOutlined />
                                    Favorite Service
                                </span>
                            ),
                            children: <FavoriteService />
                        }
                    ]}
                    className="custom-tabs"
                />
                <VoucherUser />
            </div>
        </div>
    )
}

export default Profile

