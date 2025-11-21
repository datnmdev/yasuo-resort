import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const list = [
    { url: '/', name: 'Home' },
    { url: '/rooms', name: 'Rooms' },
    { url: '/services', name: 'Services' },
    { url: '/voucher', name: 'Voucher' },
    { url: '/combo', name: 'Combo' },
    { url: '/about-us', name: 'About us' },
  ];

  return (
    <div className="mb-6 text-center bg-gray-200">
      <ul className="max-w-[600px] mx-auto flex justify-between items-center pb-3">
        {list.map((item) => {
          const isActive = currentPath === item.url;
          return (
            <li key={item.name} className="hover:scale-105 transition-all">
              <Link
                to={item.url}
                state={{ scrollTo: item.hash || '' }}
                className={`text-[1.2rem] font-bold ${isActive ? 'text-teal-600 underline scale-105' : 'text-deep-teal hover:text-teal-600'}`}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Navbar;
