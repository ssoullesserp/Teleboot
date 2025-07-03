# Teleboot - Visual Telegram Bot Builder

A full-stack web application for building Telegram bots visually, similar to fleep.bot. Create sophisticated bot flows with a drag-and-drop interface powered by React Flow.

## 🚀 Features

- **Visual Bot Builder**: Drag-and-drop interface for creating bot conversation flows
- **Pre-built Templates**: Ready-to-use bot templates for common use cases
- **Real-time Preview**: Test your bot flows as you build them
- **User Authentication**: Secure user registration and login
- **Bot Management**: Create, edit, and manage multiple bots
- **Flow Management**: Design complex conversation flows with conditional logic
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Flow** for visual flow building
- **React Router** for navigation
- **Axios** for API communication
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express and TypeScript
- **SQLite** for database (easily switchable to PostgreSQL)
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 📁 Project Structure

```
Teleboot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Main page components
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── database/       # Database setup and migrations
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   └── dist/               # Compiled JavaScript (generated)
└── README.md
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Teleboot
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template in server directory
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   # - Set JWT_SECRET to a secure random string
   # - Set TELEGRAM_BOT_TOKEN if you want to connect real bots
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the client (port 3000) and server (port 3001) concurrently.

5. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

## 🔧 Development

### Running Individual Services

**Client only:**
```bash
cd client
npm run dev
```

**Server only:**
```bash
cd server
npm run dev
```

### Building for Production

```bash
npm run build
```

This builds both client and server for production.

### Database

The application uses SQLite by default with the following tables:
- `users` - User accounts
- `bots` - Bot definitions
- `bot_flows` - Bot conversation flows
- `templates` - Pre-built bot templates
- `bot_sessions` - User conversation sessions

Database is automatically initialized on first run with sample templates.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Bots
- `GET /api/bots` - List user's bots
- `POST /api/bots` - Create new bot
- `GET /api/bots/:id` - Get bot details
- `PUT /api/bots/:id` - Update bot
- `DELETE /api/bots/:id` - Delete bot

### Flows
- `GET /api/flows/bot/:botId` - List bot's flows
- `POST /api/flows/bot/:botId` - Create new flow
- `GET /api/flows/:id` - Get flow details
- `PUT /api/flows/:id` - Update flow
- `DELETE /api/flows/:id` - Delete flow

### Templates
- `GET /api/templates` - List public templates
- `GET /api/templates/:id` - Get template details

## 🤖 Bot Templates

The application comes with pre-built templates:

1. **Customer Support Bot**
   - Handle common customer inquiries
   - FAQ responses
   - Contact information collection

2. **Lead Generation Bot**
   - Qualify prospects
   - Service information
   - Contact scheduling

## 🔐 Environment Variables

### Server (.env)
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=./teleboot.db
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### Client (Optional)
```env
VITE_API_URL=http://localhost:3001/api
```

## 🚢 Deployment

### Using Docker (Future Enhancement)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Build the application: `npm run build`
2. Copy `server/dist` and `client/dist` to your server
3. Set up your production database
4. Configure environment variables
5. Start with `node server/dist/index.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by fleep.bot and similar visual bot builders
- Built with React Flow for the visual interface
- Uses modern React and Node.js best practices