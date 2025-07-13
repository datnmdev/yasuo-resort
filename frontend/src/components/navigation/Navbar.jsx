import { Link } from 'react-router-dom';

const Navbar = () => {
  const list = [
    { url: '/', name: 'Home' },
    { url: '/rooms', name: 'Rooms' },
    { url: '/services', name: 'Services' },
    { url: '/about-us', name: 'About us' },
  ];

  return (
    <div className="mb-10 text-center">
      <ul className="max-w-[600px] mx-auto flex justify-between items-center">
        {list.map((item) => (
          <li key={item.name}>
            <Link to={item.url} className="text-[1.2rem] font-bold text-deep-teal hover:text-teal-600">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navbar;
