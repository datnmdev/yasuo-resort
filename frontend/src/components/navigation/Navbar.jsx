import { Link } from 'react-router';

const Navbar = () => {
  const list = [
    { url: '/', name: 'Home' },
    { url: '/rooms', name: 'Rooms' },
    { url: '/services', name: 'Services' },
    { url: '/dashboard', name: 'Dashboard' },
    { url: '/aboutus', name: 'About us' },
  ];
  return (
    <div className="navigation-nav-list">
      <ul className="d-flex j-between align-center">
        {list.map((item) => (
          <li key={item.name}>
            <Link to={item.url}>{item.name}</Link>
          </li>
        ))}
      </ul>
      <div className="relative">
        <p>On Lake Michigan</p>
        <Link
          to="/rooms"
          className="p-5 px-6 py-3 border border-[#0D584D] text-[#0D584D] 
                    hover:bg-[#30dec4] hover:text-white
                    font-semibold rounded-xl shadow-md 
                    transition duration-300 ease-in-out cursor-pointer
                    absolute top-0 right-[30%] animate-pulse"
        >
          Book now
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
