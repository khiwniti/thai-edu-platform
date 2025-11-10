# Quick Start Guide

Get the Thai Education Platform up and running in minutes!

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **Google AI API Key** - [Get one](https://makersuite.google.com/app/apikey)

## 5-Minute Setup

### 1. Clone the Repository

```bash
git clone https://github.com/khiwniti/thai-edu-platform.git
cd thai-edu-platform
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Google AI SDK
- TypeScript
- TailwindCSS
- And many more...

### 3. Configure Environment

Create your environment file:

```bash
cp .env.example .env.local
```

**Edit `.env.local` and add your Google AI API key:**

```bash
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

Minimum required configuration:
```env
# Required
GOOGLE_AI_API_KEY=your_google_ai_key

# Optional (databases will run in Docker)
DATABASE_URL=postgresql://thai_edu_user:thai_edu_password@localhost:5432/thai_edu
MONGODB_URI=mongodb://thai_edu_user:thai_edu_password@localhost:27017/thai_edu
REDIS_URL=redis://localhost:6379
```

### 4. Start Services

**Option A: With Docker (Recommended)**

Start all services (PostgreSQL, MongoDB, Redis, and the app):

```bash
docker-compose up
```

Access the application at: **http://localhost:3000**

Database management tools:
- **Adminer** (PostgreSQL): http://localhost:8080
- **Mongo Express** (MongoDB): http://localhost:8081 (user: admin, pass: admin123)

**Option B: Development Mode (Local)**

If you prefer to run services locally:

```bash
# Start databases only
docker-compose up -d postgres mongodb redis

# Start Next.js development server
npm run dev
```

### 5. Verify Installation

Open http://localhost:3000 in your browser. You should see the Thai Education Platform homepage!

## Testing the AI Features

### Test AI Tutor

Try the AI tutor by sending a request:

```bash
curl -X POST http://localhost:3000/api/tutor/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is 2 + 2?",
    "studentAnswer": "5",
    "correctAnswer": "4",
    "context": {
      "currentTopic": "Basic Addition",
      "studentLevel": 3,
      "learningStyle": "visual",
      "previousAttempts": 1,
      "weakAreas": ["addition"],
      "languagePreference": "th"
    },
    "language": "th"
  }'
```

### Test Content Generation

Generate practice questions:

```bash
curl -X POST http://localhost:3000/api/content/questions \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Photosynthesis",
    "gradeLevel": 7,
    "subject": "Science",
    "difficulty": 5,
    "language": "th"
  }'
```

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start development server (port 3000)
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run end-to-end tests

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Prisma Studio
```

### Project Structure

```
thai-edu-platform/
├── src/
│   ├── app/                # Next.js pages and API routes
│   │   ├── api/           # API endpoints
│   │   │   ├── tutor/     # AI tutor endpoints
│   │   │   └── content/   # Content generation endpoints
│   │   └── page.tsx       # Homepage
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components
│   │   └── features/     # Feature-specific components
│   ├── lib/              # Utilities and services
│   │   ├── ai/           # AI service layer
│   │   │   ├── index.ts          # Core AI service
│   │   │   ├── tutor.ts          # AI tutor service
│   │   │   └── content-generator.ts  # Content generator
│   │   ├── db/           # Database clients
│   │   └── utils/        # Helper functions
│   └── types/            # TypeScript type definitions
├── docs/                 # Documentation
│   ├── architecture.md   # System architecture
│   ├── api.md           # API documentation
│   └── contributing.md  # Contributing guidelines
├── infrastructure/       # DevOps and deployment
│   └── docker/          # Docker configurations
├── docker-compose.yml    # Docker Compose configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes**
   - Edit files in `src/`
   - Hot reload will automatically refresh the browser

3. **Test your changes**
   ```bash
   npm run lint          # Check for linting errors
   npm run type-check    # Check for type errors
   npm run test          # Run tests
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add my new feature"
   git push origin feature/my-new-feature
   ```

## Common Tasks

### Add a New API Endpoint

1. Create file in `src/app/api/your-endpoint/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: { message: 'Hello from API!' }
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process request
  return NextResponse.json({
    success: true,
    data: body
  });
}
```

2. Test at: `http://localhost:3000/api/your-endpoint`

### Add a New Page

1. Create file in `src/app/your-page/page.tsx`:

```typescript
export default function YourPage() {
  return (
    <div>
      <h1>Your Page</h1>
      <p>Content goes here</p>
    </div>
  );
}
```

2. Access at: `http://localhost:3000/your-page`

### Use the AI Service

```typescript
import { aiService } from '@/lib/ai';

// Generate text
const result = await aiService.generate('Explain photosynthesis in Thai');

// Generate JSON
const questions = await aiService.generateJSON<{ questions: Question[] }>(
  'Generate 5 math questions for grade 8'
);

// Use AI Tutor
import { aiTutorService } from '@/lib/ai/tutor';

const feedback = await aiTutorService.generateFeedback({
  question: 'What is 2 + 2?',
  studentAnswer: '5',
  correctAnswer: '4',
  context: { ... },
  language: 'th'
});
```

## Troubleshooting

### Port Already in Use

If port 3000 is busy:

```bash
# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up
```

### Database Connection Issues

1. Check if databases are running:
   ```bash
   docker-compose ps
   ```

2. View logs:
   ```bash
   docker-compose logs postgres
   docker-compose logs mongodb
   ```

3. Restart services:
   ```bash
   docker-compose restart
   ```

### AI API Errors

- **Check API key**: Verify `GOOGLE_AI_API_KEY` in `.env.local`
- **Check quota**: Ensure you haven't exceeded API rate limits
- **Test API**: Visit https://makersuite.google.com/ to test your key

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

Now that you're set up, explore:

1. **📚 [Architecture Guide](./docs/architecture.md)** - Understand the system design
2. **🔌 [API Documentation](./docs/api.md)** - Learn about all API endpoints
3. **🤝 [Contributing Guide](./docs/contributing.md)** - Start contributing
4. **🎨 Component Library** - Browse UI components at `/storybook` (coming soon)
5. **🧪 [Testing Guide](./docs/testing.md)** - Write tests (coming soon)

## Getting Help

- **Issues**: https://github.com/khiwniti/thai-edu-platform/issues
- **Discussions**: https://github.com/khiwniti/thai-edu-platform/discussions
- **Email**: support@thai-edu-platform.com

## Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Google AI Documentation**: https://ai.google.dev/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **TailwindCSS**: https://tailwindcss.com/docs

---

Happy coding! 🎉 If you encounter any issues, please [open an issue](https://github.com/khiwniti/thai-edu-platform/issues).
