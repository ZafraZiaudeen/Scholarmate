# Scholarmate Frontend

This is the frontend application for Scholarmate, an AI-powered educational platform for ICT Grade 11 students.

## Technology Stack
- React 18 + TypeScript
- Vite (Build Tool)
- Redux Toolkit + RTK Query (State Management)
- Tailwind CSS (Styling)
- Clerk (Authentication)
- React Router v6 (Routing)

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
This will start the Vite development server with hot module replacement.

### Build
```bash
npm run build
```
Builds the app for production to the `dist` folder.

### Preview
```bash
npm run preview
```
Locally preview the production build.

## ESLint Configuration
The project uses ESLint with recommended and type-aware rules. You can expand the configuration as needed.

## Project Structure
- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/layouts/` - Layout components
- `src/lib/` - API and utility functions
- `src/index.css` - Global styles

## Environment Variables
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk authentication key
- `VITE_API_BASE_URL` - Backend API base URL

## Additional Notes
- Uses React Hook Form for form handling
- Tailwind CSS for styling with animations and typography plugins
- Uses Radix UI components for accessibility
