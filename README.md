# VJUTest Frontend

A modern web application built with Next.js, TypeScript, and Tailwind CSS for managing and conducting tests at VJU (Vietnam Japan University).

## 🚀 Features

- Modern UI with Tailwind CSS and Radix UI components
- Type-safe development with TypeScript
- Responsive design for all devices
- Dark/Light mode support
- Role-based access control (Admin, Teacher, Student)
- Real-time updates and notifications
- File upload and management
- Interactive dashboards and analytics

## 📁 Project Structure

```
vjutest-fe/
├── src/
│   ├── app/                 # Next.js app directory (pages and layouts)
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   ├── services/           # API service functions
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
└── ...config files
```

### Key Directories

- `src/app/`: Contains all the pages and layouts of the application using Next.js 14 App Router
- `src/components/`: Reusable UI components built with Radix UI and styled with Tailwind CSS
- `src/services/`: API integration layer for communicating with the backend
- `src/hooks/`: Custom React hooks for shared logic
- `src/contexts/`: React context providers for global state management
- `src/lib/`: Utility functions, constants, and configurations
- `src/types/`: TypeScript type definitions and interfaces

## 🛠️ Technologies

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Axios](https://axios-http.com/) - HTTP client
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library
- [Recharts](https://recharts.org/) - Charting library
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vjutest-fe
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_API_URL=your_api_url_here
```

### Development

Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Running Production Build

```bash
npm run start
# or
yarn start
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 UI Components

The project uses a combination of:
- Radix UI for unstyled, accessible components
- Tailwind CSS for styling
- Custom components for specific functionality

## 🔒 Authentication

The application implements JWT-based authentication with role-based access control:
- Admin: Full system access
- Teacher: Class and test management
- Student: Test taking and viewing results

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🎯 Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for consistent styling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
