# Wiki-Quiz Bot 🎓

An intelligent web application that automatically generates interactive quizzes from Wikipedia articles. Extract key information from Wikipedia pages and transform them into engaging multiple-choice questions.

## 🌟 Features

- **Wikipedia Article Integration**: Fetch and parse Wikipedia articles automatically
- **Smart Quiz Generation**: AI-powered heuristic quiz generation from article content
- **Multiple Difficulty Levels**: Questions categorized as easy, medium, and hard
- **Entity Extraction**: Automatically identifies people, organizations, and locations mentioned in articles
- **Quiz History**: Keep track of all generated quizzes
- **Section Extraction**: Identifies and organizes article sections
- **Real-time Preview**: Preview article content before generating quizzes
- **Responsive Design**: Modern UI with Tailwind CSS and Shadcn UI components

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **React Router (Wouter)** - Client-side routing
- **React Query** - Data fetching and caching
- **Framer Motion** - Animations

### Backend
- **Express.js** - Web server framework
- **TypeScript** - Type-safe backend code
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database (via Neon)
- **Zod** - Schema validation

### Tools & Services
- **Neon** - PostgreSQL database hosting
- **Vite** - Development server and bundler
- **tsx** - TypeScript execution runtime

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL database (or use Neon for free)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Kumuda467/Wiki-Quiz.git
cd Wiki-Quiz
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration (use Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@region.neon.tech/database?sslmode=require

# Server Configuration
PORT=5000
HOST=localhost
NODE_ENV=development
```

**Get your Neon Database URL:**
1. Visit [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy your connection string
4. Paste it into the `.env` file

### 4. Initialize the Database
```bash
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
Wiki-Quiz-Bot/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/       # Shadcn UI components
│   │   │   └── *.tsx     # Custom components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utility functions
│   │   └── App.tsx       # Main app component
│   └── index.html        # HTML entry point
├── server/               # Express backend
│   ├── index.ts         # Main server file
│   ├── routes.ts        # API route handlers
│   ├── storage.ts       # Database operations
│   ├── db.ts            # Database configuration
│   ├── vite.ts          # Vite integration
│   └── static.ts        # Static file serving
├── shared/              # Shared code
│   ├── routes.ts        # API route definitions
│   └── schema.ts        # Database schema
├── script/              # Build scripts
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
└── drizzle.config.ts    # Drizzle ORM config
```

## 🎯 How It Works

1. **Input Wikipedia URL**: User provides a Wikipedia article URL
2. **Fetch & Parse**: The application fetches the HTML and extracts:
   - Article title
   - Summary text
   - Section headings
   - Key entities (people, organizations, locations)
   - Linked references
3. **Generate Quiz**: Using heuristic algorithms, the system generates:
   - Multiple choice questions
   - Correct answers
   - Difficulty levels
   - Explanations
4. **Store & Display**: Quizzes are saved to the database and displayed in an interactive format
5. **History**: Users can view their quiz generation history

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push         # Push database schema changes
npm run db:generate     # Generate database migrations

# TypeScript
npm run check           # Type check the project
```

## 🌐 API Endpoints

### GET `/api/wiki/preview`
Preview a Wikipedia article without generating a quiz
- **Query**: `url` - Wikipedia article URL
- **Returns**: Article title, summary, sections, entities

### POST `/api/wiki/generate`
Generate a quiz from a Wikipedia article
- **Body**: 
  ```json
  {
    "url": "https://en.wikipedia.org/wiki/Alan_Turing",
    "forceRegenerate": false,
    "storeRawHtml": false
  }
  ```
- **Returns**: Complete quiz with questions, options, answers, and difficulty levels

### GET `/api/wiki/history`
Get the history of generated quizzes
- **Query**: `q` - Search query (optional)
- **Returns**: List of quizzes with metadata

### GET `/api/wiki/:id`
Get a specific quiz by ID
- **Returns**: Full quiz details

## 🗄️ Database Schema

### wiki_quizzes Table
```sql
- id (UUID, primary key)
- url (text, unique)
- title (text)
- summary (text)
- sections (text array)
- key_entities (jsonb)
  - people: string[]
  - organizations: string[]
  - locations: string[]
- quiz (jsonb)
  - question: string
  - options: [string, string, string, string]
  - answer: string
  - difficulty: "easy" | "medium" | "hard"
  - explanation: string
- related_topics (text array)
- content_hash (text)
- raw_html (text, optional)
- created_at (timestamp)
```

## 🔌 Features in Detail

### Quiz Generation Algorithm
- Analyzes article content to extract key information
- Generates questions about sections, entities, and key facts
- Creates plausible distractor options
- Assigns difficulty levels based on question complexity
- Provides explanations for each answer

### Entity Recognition
- Identifies people from linked Wikipedia pages
- Extracts organizations and institutions
- Recognizes geographic locations
- Uses keyword matching and pattern recognition

### Storage Options
- **PostgreSQL (Neon)**: For production and persistent storage
- **In-Memory**: Fallback when database is unavailable (development)

## 🚀 Deployment

### Deploy to Production
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
DATABASE_URL=postgresql://...neon.tech/...
PORT=5000
NODE_ENV=production
```

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Database Connection Error
- Ensure your Neon database URL is correct in `.env`
- Check your internet connection
- Verify the database credentials

### Quiz Generation Fails
- Ensure the Wikipedia URL is valid
- Check that the article has enough content
- Verify the database connection

### Port Already in Use
```bash
# Change PORT in .env file or use:
PORT=3000 npm run dev
```

## 📚 Additional Resources

- [Wikipedia API Documentation](https://www.mediawiki.org/wiki/API/Main_page)
- [Neon PostgreSQL Documentation](https://neon.tech/docs/introduction)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## 👨‍💻 Author

**Kumuda467**

## ⭐ Show Your Support

If you find this project helpful, please give it a star! Your support helps me create better projects.

---

Made with ❤️ by Kumuda467
