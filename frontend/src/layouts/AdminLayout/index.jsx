import { Outlet } from "react-router";

export default function AdminLayout() {
  return (
    <div>
      <div>(Admin) Đây là Header</div>

      <div>
        <Outlet />
      </div>

      <div>(Admin) Đây là Footer</div>
    </div>
  )
}