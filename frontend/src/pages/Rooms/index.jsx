import React from 'react'
import { Link } from 'react-router'

const RoomPage = () => {

    //giả lập danh sách phòng lấy từ API
    const rooms = [
        {
          id: 1,
          name: 'Lakeview Suite',
          price: 120,
          image: '/homepage-image-1.jpg',
          description: 'A cozy room with lake views and private balcony.',
        },
        {
          id: 2,
          name: 'Garden Villa',
          price: 150,
          image: '/homepage-image-1.jpg',
          description: 'Spacious villa surrounded by garden greenery.',
        },
        {
          id: 3,
          name: 'Deluxe Room',
          price: 100,
          image: '/homepage-image-1.jpg',
          description: 'Comfortable room with modern amenities.',
        },
        {
          id: 4,
          name: 'Family Bungalow',
          price: 180,
          image: '/homepage-image-1.jpg',
          description: 'Perfect for families, with 2 bedrooms and pool access.',
        },
    ]
  return (
    <div className="mt-16 mb-16 max-w-[1400px] mx-auto">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {rooms.map((room) => (
          <Link
            to={`/rooms/${room.id}`}
            key={room.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
          >
            <img src={room.image} alt={room.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
              <p className="text-gray-600 text-sm mb-3">{room.description}</p>
              <div className="text-green-700 font-bold text-lg mb-4">${room.price}/night</div>
              <div className="inline-block w-full bg-[#0D584D] text-white text-center py-2 rounded-lg">
                View Details
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RoomPage