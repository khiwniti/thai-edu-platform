# Theme Switcher - Quick Start Guide

## For Developers

### Using the Theme Switcher in Your Components

The theme switcher is already integrated into the application. To use it in your own components:

```tsx
import { ThemeSwitcher } from '@/components/theme-switcher';

function MyComponent() {
  return (
    <div>
      <ThemeSwitcher />
    </div>
  );
}
```

### Accessing Current Theme in Components

```tsx
"use client";

import { useTheme } from 'next-themes';

function MyThemedComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Go Dark</button>
    </div>
  );
}
```

### Adding Dark Mode Styles to Components

Use Tailwind's `dark:` prefix for dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  This text and background will change based on theme
</div>
```

### Programmatically Changing Theme

```tsx
import { useTheme } from 'next-themes';

function ThemeButton() {
  const { setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Switch to Dark Mode
    </button>
  );
}
```

## API Usage

### Get User's Theme Preference

```typescript
// GET /api/preferences/theme
const response = await fetch('/api/preferences/theme', {
  credentials: 'include'
});
const data = await response.json();
console.log(data.theme); // "light", "dark", or "system"
```

### Update User's Theme Preference

```typescript
// POST /api/preferences/theme
const response = await fetch('/api/preferences/theme', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ theme: 'dark' })
});
const data = await response.json();
console.log(data.message); // "Theme preference updated successfully"
```

## Testing

### Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000

3. For non-authenticated users:
   - Theme switcher is in the top-right corner
   - Changes saved to localStorage only

4. For authenticated users:
   - Login to the platform
   - Theme switcher is in the dashboard header
   - Changes saved to database and sync across devices

### Manual Testing Checklist

- [ ] Theme switcher appears on landing page
- [ ] Theme switcher appears in dashboard header
- [ ] Clicking switcher opens dropdown menu
- [ ] Selecting "Light" applies light theme
- [ ] Selecting "Dark" applies dark theme
- [ ] Selecting "System" follows system preference
- [ ] Theme persists after page refresh
- [ ] Theme persists after logout/login (authenticated users)
- [ ] No flash of unstyled content on page load

## Common Issues

### Theme Not Persisting
**Solution**: Check that `ThemeProvider` is wrapped around your app in the root layout.

### Flash of Wrong Theme on Load
**Solution**: Ensure `suppressHydrationWarning` is set on the `<html>` tag.

### Theme Not Syncing Across Devices
**Solution**: 
1. Verify user is authenticated
2. Check API endpoint is responding correctly
3. Check database `theme` field is updating

### Dark Mode Styles Not Working
**Solution**: 
1. Ensure Tailwind config has `darkMode: 'class'` (default with next-themes)
2. Use `dark:` prefix in class names
3. Check CSS variables are defined in globals.css

## Architecture

```
┌─────────────────────────────────────────────────┐
│           ThemeProvider (Root Layout)           │
│  - Wraps entire app                             │
│  - Provides theme context                       │
│  - Manages localStorage                         │
└─────────────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼──────────┐         ┌────────▼─────────┐
│  ThemeSwitcher   │         │   Your Component │
│  Component       │         │                  │
│  - UI Control    │         │  useTheme()      │
│  - Backend Sync  │         │  - Get theme     │
└───────┬──────────┘         │  - Set theme     │
        │                    └──────────────────┘
        │
┌───────▼──────────────────────────────────────┐
│      /api/preferences/theme                  │
│  - GET: Retrieve user theme                  │
│  - POST: Save user theme                     │
│  - Auth: Required for persistence            │
└───────┬──────────────────────────────────────┘
        │
┌───────▼──────────────────────────────────────┐
│      Database (PostgreSQL + Prisma)          │
│  User.theme: String (light/dark/system)      │
└──────────────────────────────────────────────┘
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Theme switching is instant (no API delay visible)
- Backend sync happens asynchronously
- No impact on page load performance
- LocalStorage used as fallback for non-authenticated users

---

**Need help?** Check the full documentation in `THEME_SWITCHER_INTEGRATION.md`
