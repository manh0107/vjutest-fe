import React, { useEffect, useState } from "react";

const images = [
  { src: "/bia-web-1-1.png" },
  { src: "/bia.png", text: "Chào mừng đến trang web thi trực tuyến VJUTest" },
  { src: "/Thiet-ke-chua-co-ten-6.png" },
];

export default function StudentBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000); // 4 giây đổi ảnh
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 rounded-3xl overflow-hidden shadow-xl relative aspect-[3/1] bg-gray-100">
      <img
        src={images[index].src}
        alt="Student Banner"
        className="w-full h-full object-cover transition-all duration-700"
        style={{ minHeight: 220 }}
      />
      {images[index].text && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
          <h1 className="text-white text-2xl md:text-4xl font-extrabold drop-shadow-lg text-center px-4 animate-fade-in">
            {images[index].text}
          </h1>
        </div>
      )}
      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((img, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${i === index ? 'bg-white/90 shadow' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
} 