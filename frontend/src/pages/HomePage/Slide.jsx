import React from 'react'
import Slider from 'react-slick'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

const Slide = () => {
    const slides = [
        { url: "./slice-image-1.jpg" },
        { url: "./slice-image-2.jpg" },
        { url: "./slice-image-3.jpg" },
        { url: "./slice-image-4.jpg" },
        { url: "./slice-image-5.jpg" }
    ]

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: false,
        pauseOnHover: false
      }

    return (
        <div className="w-full flex items-center justify-center ">
            <div className="w-full max-w-[1800px]">
                <Slider {...settings}>
                {slides.map((slide, index) => (
                    <div key={index}>
                    <img
                        src={slide.url}
                        alt={`slide-${index}`}
                        className="w-full h-[900px] object-cover"
                    />
                    </div>
                ))}
                </Slider>
            </div>
        </div>
    )
}

export default Slide
