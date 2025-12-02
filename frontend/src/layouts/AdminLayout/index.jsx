import { Outlet } from 'react-router';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex justify-between bg-white">
      <div className="h-[100vh] overflow-auto border-r-[1px] border-solid border-gray-300 shrink-0">
        <Sidebar />
      </div>

      <div className="grow h-[100vh] overflow-hidden flex flex-col">
        <div>
          <Header />
        </div>

        <div className="grow overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
