import React from 'react'

const Navbar = () => {
    const list = [
        {url:'/', name: "Home"},
        {url:'/', name: "Rooms"},
        {url:'/', name: "Services"},
        {url:'/', name: "Dashboard"},
        {url:'/', name: "About us"}
    ]
    return (
        <div className='navigation-nav-list'>
            <ul className='d-flex j-between align-center'>
                {list.map((items) => {
                    return <li>
                        <a className="" href={items.url}>{items.name}</a>
                    </li>
                })}
            </ul>
            <div className='relative'>
                <p>On Lake Michigan</p>
                <a href ='/rooms' className='p-5 px-6 py-3 border border-[#0D584D] text-[#0D584D] 
                    hover:bg-[#30dec4] hover:text-white
                    font-semibold rounded-xl shadow-md 
                    transition duration-300 ease-in-out cursor-pointer
                    absolute top-0 right-[30%] animate-pulse'>Book now</a>
            </div>
        </div>
  )
}

export default Navbar