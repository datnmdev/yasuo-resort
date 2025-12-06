import {
  BuildOutlined,
  HomeOutlined,
  ToolOutlined,
  GiftOutlined,
  TrophyOutlined,
  AppstoreAddOutlined,
  AuditOutlined,
  TagsOutlined,
  FormOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router';

const items = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },

  {
    key: '/admin/booking-request',
    icon: <AuditOutlined />,
    label: 'Booking Requests',
  },

  {
    key: '/admin/room-management',
    icon: <HomeOutlined />,
    label: 'Rooms Management',
  },

  {
    key: '/admin/room-type-management',
    icon: <TagsOutlined />,
    label: 'Room Types Management',
  },

  {
    key: '/admin/service-management',
    icon: <ToolOutlined />,
    label: 'Services Management',
  },

  {
    key: '/admin/combo-management',
    icon: <AppstoreAddOutlined />,
    label: 'Combo Management',
  },

  {
    key: '/admin/voucher-management',
    icon: <GiftOutlined />,
    label: 'Voucher Management',
  },

  {
    key: '/admin/tier-management',
    icon: <TrophyOutlined />,
    label: 'Tier Management',
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <img className="w-40 mx-auto" src="/logo_resort_2.png" alt="logo" />
      <Menu
        defaultSelectedKeys={['/admin/dashboard']}
        selectedKeys={[location.pathname]}
        mode="inline"
        theme="light"
        items={items}
        style={{ width: 256, height: '100%' }}
        onSelect={(info) => navigate(info.key)}
      />
    </div>
  );
}
