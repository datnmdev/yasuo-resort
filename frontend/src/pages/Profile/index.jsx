import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { userSelector } from '@src/stores/reducers/userReducer';
import { Card, Avatar, Descriptions, Button, Tag, Upload, Input } from 'antd';
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
} from '@ant-design/icons';
import user from '@apis/user';
import upload from '@apis/upload';

const Profile = () => {

    const [userInfo, setuserInfo] = useState({});
    
    const [dataUpdate, setDataUpdate] = useState({})


    const genderTag = {
        male: <Tag color="blue"><ManOutlined /> Nam</Tag>,
        female: <Tag color="magenta"><WomanOutlined /> Nữ</Tag>,
        other: <Tag color="purple"><UserOutlined /> Khác</Tag>,
    };

    const getProfile = async () => {
        try {
            const res = await user.getProfile();
            const userData = res?.data?.data || {};
            setuserInfo(userData);
            setDataUpdate({...dataUpdate, avatar: userData.avatar, phone: userData.phone})
        } catch (error) {
            console.error("Lỗi lấy profile:", error);
        }
    };

    const handleSaveInfo = async() => {
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
                setuserInfo({...userInfo, avatar:path})
                setDataUpdate({...dataUpdate, avatar:path})
            } else {
                alert("Upload thất bại!");
            }
        } catch (error) {
            console.error("Lỗi upload avatar:", error);
        }

        return false; // Ngăn Ant Design Upload tự động upload
    }

    useEffect(() => {getProfile()},[])
    useEffect(()=>{},[userInfo])
    return (
        <div className="flex justify-center p-6 bg-gray-50 min-h-screen">
            <Card
                style={{ width: 700 }}
                cover={<div className="h-32 bg-blue-500 rounded-t-md"></div>}
                actions={[
                    <Button type="primary" onClick={handleSaveInfo}>Lưu</Button>
                ]}
            >
                 <Upload
                    showUploadList={false}
                    beforeUpload={handleUploadAvatar}
                >
                    <div className="flex justify-center -mt-14 mb-4 cursor-pointer">
                        <Avatar
                            size={120}
                            src={userInfo?.avatar ? `${import.meta.env.VITE_API_BASE_URL}/${userInfo.avatar}` : undefined}
                            style={{ border: "2px solid white" }}
                        />
                    </div>
                </Upload>

                <Descriptions
                title="Thông tin cá nhân"
                column={1}
                bordered
                >
                <Descriptions.Item label="Họ tên">{userInfo.name}</Descriptions.Item>

                <Descriptions.Item label="CCCD">
                    <IdcardOutlined className="mr-2" />
                    {userInfo.cccd}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày cấp / Nơi cấp">
                    {userInfo.identityIssuedAt} - {userInfo.identityIssuedPlace}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày sinh">
                    <CalendarOutlined className="mr-2" />
                    {userInfo.dob}
                </Descriptions.Item>

                <Descriptions.Item label="Giới tính">
                    {genderTag[userInfo.gender]}
                </Descriptions.Item>

                <Descriptions.Item label="Email">
                    <MailOutlined className="mr-2" />
                    {userInfo.email}
                </Descriptions.Item>

                <Descriptions.Item label="Số điện thoại">
                    <PhoneOutlined className="mr-2" />
                    <Input
                        value={dataUpdate.phone}
                        onChange={(e) => setDataUpdate({...dataUpdate,phone:e.target.value})}
                        style={{ maxWidth: 200 }}
                    />
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ thường trú">
                    <HomeOutlined className="mr-2" />
                    {userInfo.permanentAddress}
                </Descriptions.Item>

                <Descriptions.Item label="Vai trò">
                    <Tag color={userInfo.role === 'admin' ? 'red' : 'blue'}>
                    {userInfo.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái tài khoản">
                    <Tag color={userInfo.status === 'active' ? 'green' : 'volcano'}>
                    {userInfo.status === 'active' ? 'Hoạt động' : 'Chưa kích hoạt'}
                    </Tag>
                </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    )
}

export default Profile

