# Contributing Guide

Thank you for your interest in contributing to the Thai Education Platform! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors must:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Docker (for local development with databases)
- A Google AI API key (for AI features)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/thai-edu-platform.git
   cd thai-edu-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development environment**
   ```bash
   # Start databases with Docker Compose
   docker-compose up -d postgres mongodb redis
   
   # Run database migrations
   npm run db:migrate
   
   # Start development server
   npm run dev
   ```

5. **Verify setup**
   - Open http://localhost:3000
   - Check that the application loads
   - Test basic functionality

## Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:

```
<type>/<short-description>

Examples:
- feature/ai-tutor-improvements
- fix/authentication-bug
- docs/api-documentation
- refactor/database-queries
```

### Types

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes
- `chore/` - Build process or auxiliary tool changes

### Creating a New Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Commit your changes
git add .
git commit -m "feat: add new AI tutoring feature"

# Push to your fork
git push origin feature/your-feature-name
```

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Define types** for all function parameters and return values
- **Avoid `any`** - use specific types or `unknown`
- **Use interfaces** for object shapes
- **Export types** that are used across modules

Example:
```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<UserProfile> {
  // implementation
}

// Bad
async function getUser(id: any): Promise<any> {
  // implementation
}
```

### React Components

- **Use functional components** with hooks
- **Keep components small** and focused
- **Extract reusable logic** into custom hooks
- **Use TypeScript** for prop types

Example:
```typescript
// Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, onClick, children }: ButtonProps) {
  return (
    <button 
      className={cn('btn', variant)} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Bad
export function Button(props: any) {
  return <button {...props} />;
}
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile`, `AITutor`)
- **Functions**: camelCase (`getUserProfile`, `generateContent`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (`User`, `ContentGenerationRequest`)
- **Files**: kebab-case (`ai-tutor.ts`, `user-profile.tsx`)

### Code Style

We use Prettier for code formatting. Run before committing:

```bash
npm run format
```

Key style points:
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multi-line objects/arrays
- Max line length: 100 characters

### Comments

- **Write self-documenting code** - names should be clear
- **Add comments** for complex logic or non-obvious decisions
- **Use JSDoc** for public APIs and functions

Example:
```typescript
/**
 * Generate personalized feedback for a student's answer
 * 
 * @param request - The feedback request containing question, answer, and context
 * @returns Promise resolving to structured feedback with hints and explanations
 * @throws {AIServiceError} If AI generation fails
 */
async function generateFeedback(
  request: TutorFeedbackRequest
): Promise<Feedback> {
  // Implementation
}
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI configuration changes

### Examples

```bash
# Feature
git commit -m "feat(ai-tutor): add Thai cultural context to feedback"

# Bug fix
git commit -m "fix(auth): resolve token refresh issue"

# Documentation
git commit -m "docs: update API documentation for content generation"

# Multiple changes
git commit -m "feat(learning-path): implement adaptive difficulty

- Add algorithm for difficulty adjustment
- Include prerequisite checking
- Update progress tracking logic"
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest main branch
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests**
   ```bash
   npm run test
   npm run test:e2e
   ```

3. **Check linting**
   ```bash
   npm run lint
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

### Submitting a Pull Request

1. **Push your branch** to your fork
   ```bash
   git push origin your-branch
   ```

2. **Create a Pull Request** on GitHub

3. **Fill out the PR template** with:
   - Description of changes
   - Related issue number (if applicable)
   - Testing performed
   - Screenshots (if UI changes)
   - Checklist completion

### PR Template

```markdown
## Description
Brief description of the changes

## Related Issue
Fixes #123

## Changes Made
- Item 1
- Item 2
- Item 3

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] AI features tested with real API

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### Review Process

- PRs require **at least one approval** from a maintainer
- Address all review comments
- Keep PR scope focused and reasonably sized
- Be responsive to feedback

## Testing

### Running Tests

```bash
# All tests
npm run test:all

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Watch mode
npm run test -- --watch
```

### Writing Tests

#### Unit Tests

```typescript
// src/lib/utils/__tests__/format.test.ts
import { formatCurrency } from '../format';

describe('formatCurrency', () => {
  it('formats Thai Baht correctly', () => {
    expect(formatCurrency(1000, 'th')).toBe('฿1,000.00');
  });

  it('handles zero correctly', () => {
    expect(formatCurrency(0, 'th')).toBe('฿0.00');
  });
});
```

#### Integration Tests

```typescript
// src/app/api/tutor/__tests__/feedback.test.ts
import { POST } from '../feedback/route';

describe('/api/tutor/feedback', () => {
  it('generates feedback for incorrect answer', async () => {
    const request = new Request('http://localhost/api/tutor/feedback', {
      method: 'POST',
      body: JSON.stringify({
        question: 'What is 2 + 2?',
        studentAnswer: '5',
        correctAnswer: '4',
        context: { ... },
        language: 'th'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.type).toBe('incorrect');
  });
});
```

### Test Coverage

- Aim for **>80% code coverage**
- **100% coverage** for critical paths (auth, grading, payments)
- Test edge cases and error conditions

## Documentation

### Code Documentation

- **Add JSDoc comments** for all exported functions and classes
- **Include examples** for complex APIs
- **Document parameters** and return values

### README Updates

Update README.md if you:
- Add new features
- Change installation steps
- Modify configuration
- Add new dependencies

### API Documentation

Update `docs/api.md` if you:
- Add new endpoints
- Change endpoint behavior
- Modify request/response formats

### Architecture Documentation

Update `docs/architecture.md` if you:
- Change system architecture
- Add new services
- Modify data flow

## Thai Language Contributions

When contributing Thai language content:

- **Use proper Thai grammar** and spelling
- **Maintain cultural appropriateness**
- **Provide both Thai and English** versions for user-facing text
- **Test with Thai Unicode** to ensure proper rendering
- **Consider Thai reading conventions**

Example:
```typescript
const messages = {
  th: 'ยินดีต้อนรับสู่แพลตฟอร์มการศึกษาไทย',
  en: 'Welcome to Thai Education Platform'
};
```

## AI/ML Contributions

When working with AI features:

- **Test with actual AI API** (not just mocks)
- **Include prompt examples** in documentation
- **Consider token usage** and costs
- **Handle rate limits** appropriately
- **Test with Thai language** input
- **Verify cultural appropriateness** of AI outputs

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For security issues (security@thai-edu-platform.com)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Thai Education! 🇹🇭 🎓
