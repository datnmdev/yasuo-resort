import SignIn from './SignIn';

const Logo = () => {
  return (
    <div className="relative h-[200px] flex justify-center items-center bg-gray-200">
      <a href="#hero">
        <img src="/logo_resort_2.png" alt="logo" className="w-[300px] h-[200px]" />
      </a>
      <div className="absolute top-[10%] right-[10%]">
        <SignIn />
      </div>
    </div>
  );
};

export default Logo;
