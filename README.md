# Remote Attendance System

A modern web application for managing remote work attendance and daily reports, built with Next.js and TypeScript.

🌐 [Production Site](https://axpr-poc-1-302c717e5d41.herokuapp.com/)

## Features

- 👥 User Authentication

  - Email/password authentication
  - Role-based access control (Admin/User)
  - Secure session management

- ⏰ Attendance Management

  - Clock in/out tracking
  - Real-time attendance status
  - Attendance history view
  - Working hours calculation

- 📝 Daily Reports
  - Daily work report submission
  - Report status workflow (Draft → Submitted → Reviewed)
  - Comment system for feedback
  - Report history and tracking

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Getting Started

### Prerequisites

- Node.js 23.x
- pnpm 10.x
- PostgreSQL 17

### Local Development

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd remote-attendance
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:

   ```bash
   pnpm prisma generate
   pnpm prisma db push
   pnpm seed
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Using Docker

1. Build and start the containers:

   ```bash
   make run
   ```

2. Stop the containers:
   ```bash
   make down
   ```

## Test Accounts

- **Admin User**:

  - Email: admin@example.com
  - Password: password123

- **Regular User**:
  - Email: test@example.com
  - Password: password123

## Deployment

The application is deployed on Heroku. Deployments are automatically triggered when changes are pushed to the main branch.

### Manual Deployment

```bash
git push heroku main
```

## Project Structure

```
app/
├── api/              # API routes
│   ├── auth/         # Authentication endpoints
│   ├── attendance/   # Attendance endpoints
│   └── reports/      # Daily reports endpoints
├── components/       # Reusable components
├── lib/             # Shared utilities
└── types/           # TypeScript definitions
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is private and confidential. All rights reserved.
