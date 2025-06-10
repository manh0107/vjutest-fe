import Image from 'next/image';

export default function Footer() {
  return (
    <footer id="footer" className="bg-white text-[#222] mt-12 pt-8 pb-4 px-4 border-t border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-8">
        <div className="flex-1 min-w-[180px] mb-6 md:mb-0 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            <Image src="/vju_logo.svg" alt="VJU Logo" width={36} height={36} className="rounded-full" />
            <span className="text-2xl font-bold text-[#b8021e]">VJUTest</span>
          </div>
          <div className="flex space-x-3 mb-2">
            <a href="#" aria-label="Facebook" className="hover:text-[#b8021e] transition"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg></a>
            <a href="#" aria-label="Instagram" className="hover:text-red-400"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.094 12 2.094m0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.635.4 3.661 1.374c-.974.974-1.246 2.241-1.308 3.608C2.175 8.353 2.163 8.733 2.163 12s.012 3.584.07 4.85c.062 1.366.334 2.633 1.308 3.608.974.974 2.241 1.246 3.608 1.308 1.266.058 1.646.069 4.85.069s3.584-.012 4.85-.07c1.366-.062 2.633-.334 3.608-1.308.974-.974 1.246-2.241 1.308-3.608.058-1.266.069-1.646.069-4.85s-.012-3.584-.07-4.85c-.062-1.366-.334-2.633-1.308-3.608-.974-.974-2.241-1.246-3.608-1.308C15.647 2.175 15.267 2.163 12 2.163z"/><path d="M12 5.838A6.162 6.162 0 0 0 5.838 12 6.162 6.162 0 0 0 12 18.162 6.162 6.162 0 0 0 18.162 12 6.162 6.162 0 0 0 12 5.838zm0 10.162A3.999 3.999 0 1 1 16 12a3.999 3.999 0 0 1-4 4zm6.406-11.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg></a>
            <a href="#" aria-label="Twitter" className="hover:text-red-400"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.555-2.005.959-3.127 1.184A4.916 4.916 0 0 0 16.616 3c-2.717 0-4.924 2.206-4.924 4.924 0 .386.044.763.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.724-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg></a>
            <a href="#" aria-label="YouTube" className="hover:text-red-400"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.5 20.5 12 20.5 12 20.5s7.5 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            <a href="#" aria-label="TikTok" className="hover:text-red-400"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v14.25a3.75 3.75 0 1 1-3.75-3.75h1.5a2.25 2.25 0 1 0 2.25 2.25V2h1.5a4.5 4.5 0 0 0 4.5 4.5V8A6 6 0 0 1 12.75 2z"/></svg></a>
          </div>
        </div>
        <div className="flex-1 min-w-[180px] mb-6 md:mb-0">
          <div className="font-bold mb-2">Về VJUTest</div>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:underline">Giới thiệu</a></li>
            <li><a href="#" className="hover:underline">Liên hệ</a></li>
            <li><a href="#" className="hover:underline">Điều khoản bảo mật</a></li>
            <li><a href="#" className="hover:underline">Điều khoản sử dụng</a></li>
          </ul>
        </div>
        <div className="flex-1 min-w-[180px] mb-6 md:mb-0">
          <div className="font-bold mb-2">Tài nguyên</div>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:underline">Thư viện đề thi</a></li>
            <li><a href="#" className="hover:underline">Blog</a></li>
            <li><a href="#" className="hover:underline">Tổng hợp tài liệu</a></li>
          </ul>
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="font-bold mb-2">Chính sách chung</div>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:underline">Hướng dẫn sử dụng</a></li>
            <li><a href="#" className="hover:underline">Hướng dẫn thanh toán</a></li>
            <li><a href="#" className="hover:underline">Phản hồi, khiếu nại</a></li>
            <li><a href="#" className="hover:underline">Chính sách chuyển đổi</a></li>
            <li><a href="#" className="hover:underline">Điều khoản và Điều kiện</a></li>
          </ul>
        </div>
      </div>
      <hr className="my-4 border-[#e5e7eb]" />
      <div className="text-center text-sm text-gray-500">© VJUTest@gmail.com</div>
    </footer>
  );
} 