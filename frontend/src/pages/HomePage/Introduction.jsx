import React from 'react'
import { Link } from 'react-router'

const Introduction = () => {
  return (
    <div className='container mx-auto'>
        <div className='text-center mt-16 mb-12'>
            <p className='text-5xl font-bold text-[#0D584D]'>
                Experience Saugatuck 
            </p>
            <p className='text-5xl font-bold text-[#0D584D]'>
                & Stay on Lake Michigan
            </p>
        </div>
        <div className=''>
            <p className='text-2xl text-[#222222] text-center mb-6'>
            Welcome to Yasuo Resort, a peaceful retreat where you can relax, refresh, and reconnect.  
            With nature all around us and lake views from every room, deck, and pool, we combine the tranquility 
            of a waterside resort with a convenient location just three miles from downtown Saugatuck.  
            </p>
            <p className='text-2xl text-[#222222] text-center mb-16'>
            Start your morning with breakfast overlooking Lake Michigan. By day, you can explore the area with 
            our kayaks and bikes, hike the wooded trails on our property, take a dip in the lake, or wander the 
            many shops, galleries, and restaurants in town. At night, come back to watch a spectacular sunset 
            around the fire pits, or snuggle up and stargaze from our deck at the water’s edge.
            </p>
        </div>
        <div className='homepage-block-image-1 mb-12'>
            <div className='block-image-1-1'>
                <img src="./homepage-image-1.jpg" alt="" />
            </div>
            <div className='block-image-1-2'>
                <img src="./homepage-image-2.jpg" alt="" />
            </div>
        </div>
        <div className='homepage-block-image-2 mb-12'>
            <div className='block-image-2-1'>
                <img src="./homepage-image-3.jpg" alt="" />
            </div>
            <div className='block-image-2-2'>
                <img src="./homepage-image-4.jpg" alt="" />
            </div>
        </div>
        <div className='homepage-block-image-3'>
            <div className='block-image-3-1'>
                <img src="./homepage-image-5.jpg" alt="" />
            </div>
            <div className='block-image-3-2'>
                <img src="./homepage-image-6.jpg" alt="" />
            </div>
        </div>
        <div className=''>
            <div className='text-center mt-16 mb-12'>
                <p className='text-3xl font-bold text-[#0D584D]'>
                    It's time to prioritize yourself.
                </p>
                <p className='text-3xl font-bold text-[#0D584D]'>
                    Allow us to help you find that much-needed moment to unwind and truly enjoy.
                </p>
                <p className='text-3xl font-bold text-[#0D584D]'>
                    We're here to turn that into a reality.
                </p>
                <p className='mt-16'>
                    <Link to='/' className='text-3xl font-bold text-[#007bff]'>Why not get for you a room</Link>
                </p>
            </div>
        </div>
    </div>
  )
}

export default Introduction