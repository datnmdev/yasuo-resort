import { Outlet } from "react-router";

export default function UserLayout() {
  return (
    <div>
      <div>(User) Đây là Header</div>

      <div>
        <Outlet />
      </div>

      <div>(User) Đây là Footer</div>
    </div>
  )
}