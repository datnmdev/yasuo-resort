import React from 'react'
import { Link } from 'react-router'

const SingIn = () => {
  return (
    <>
      <Link
        to='/login'
        className='btn-signin p-5 px-6 py-3 
        bg-[#0D584D] hover:bg-[#30dec4] text-white 
        font-semibold rounded-xl shadow-md transition 
        duration-300 ease-in-out cursor-pointer'>
          Sign in
        </Link>
    </>
  )
}

export default SingIn