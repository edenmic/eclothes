# Second-Hand Marketplace Implementation Guide

## Project Setup

1. **Initialize Project**
```bash
npm create vite@latest edenapp -- --template react
cd edenapp
npm install
```

2. **Install Required Dependencies**
```bash
# Icons
npm install lucide-react

# Routing
npm install react-router-dom

# State Management & Data Fetching
npm install @tanstack/react-query
npm install zustand # for global state management

# Supabase
npm install @supabase/supabase-js

# Form Handling
npm install react-hook-form zod @hookform/resolvers

# Image handling
npm install browser-image-compression
```

## Project Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── auth/
│   │   ├── SignIn.jsx
│   │   └── SignUp.jsx
│   ├── items/
│   │   ├── ItemCard.jsx
│   │   ├── ItemList.jsx
│   │   ├── ItemDetail.jsx
│   │   └── ItemForm.jsx
│   └── profile/
│       ├── ProfileView.jsx
│       └── ProfileEdit.jsx
├── styles/
│   ├── global.css
│   ├── components/
│   │   ├── header.css
│   │   ├── footer.css
│   │   ├── item-card.css
│   │   └── forms.css
│   └── pages/
│       ├── home.css
│       ├── auth.css
│       └── profile.css
├── lib/
│   ├── supabase.js # Supabase client config
│   └── utils.js
├── hooks/
│   ├── useAuth.js
│   └── useItems.js
├── pages/
│   ├── Home.jsx
│   ├── Auth.jsx
│   ├── Profile.jsx
│   ├── ItemDetail.jsx
│   └── CreateListing.jsx
├── store/
│   └── authStore.js
└── App.jsx
```

## Implementation Steps

### 1. Supabase Setup

1. Create a new Supabase project
2. Create the following tables in Supabase:

```sql
-- Users table (extends Supabase auth)
create table public.profiles (
  id uuid references auth.users primary key,
  name text,
  city text,
  contact_number text,
  bio text,
  profile_picture text,
  height float,
  size text,
  rating_average float default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Items table
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  title text not null,
  description text,
  category text,
  price decimal,
  size text,
  brand text,
  condition text,
  color text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Item Images table
create table public.item_images (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id),
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Reviews table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  reviewer_id uuid references public.profiles(id),
  reviewee_id uuid references public.profiles(id),
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 2. Authentication Implementation

1. Create Supabase Client (`lib/supabase.js`):
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

2. Implement Authentication Hook (`hooks/useAuth.js`)
3. Create Sign In and Sign Up components

### 3. Core Features Implementation

#### User Profile
1. Create profile management components
2. Implement image upload for profile pictures
3. Add profile editing functionality

#### Item Listings
1. Create item form with image upload
2. Implement item listing display
3. Add item search and filtering
4. Create detailed item view

#### Search & Filtering
1. Implement search bar with category filters
2. Add price range filter
3. Implement sorting functionality

#### Reviews & Ratings
1. Create review form component
2. Implement rating display
3. Add user rating calculation

### CSS Structure

1. **Global Styles** (`styles/global.css`)
   - Reset CSS
   - Typography
   - Variables (colors, spacing, breakpoints)
   - Common utility classes

2. **Component Styles**
   - Each component has its own CSS file
   - BEM methodology for class naming
   - Mobile-first responsive design

3. **Example CSS Structure**:
```css
/* Variables */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --light-gray: #f8f9fa;
  --dark-gray: #343a40;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  --border-radius: 4px;
}

/* Typography */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: var(--dark-gray);
}

/* Common Components */
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button--primary {
  background-color: var(--primary-color);
  color: white;
}

.input {
  padding: var(--spacing-sm);
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  width: 100%;
}
```

## Testing

1. **Unit Testing**
```bash
npm install vitest @testing-library/react @testing-library/jest-dom --save-dev
```

2. **Components to Test**
- Authentication flow
- Item creation and editing
- Search and filtering
- Review submission

## Deployment

1. **Environment Setup**
- Create `.env` files for development and production
- Configure Supabase environment variables

2. **Build & Deploy**
```bash
npm run build
```

3. **Deploy to Vercel/Netlify**
- Connect repository to chosen platform
- Configure environment variables
- Deploy application

## Security Considerations

1. Implement rate limiting for API calls
2. Add input validation using Zod
3. Configure proper CORS settings in Supabase
4. Implement proper authorization checks for data access

## Performance Optimization

1. Implement image optimization
2. Add lazy loading for images and components
3. Implement proper caching strategies
4. Use pagination for item listings

## Future Enhancements

1. In-app messaging system
2. Payment gateway integration
3. Admin dashboard
4. Mobile app development

Remember to check the official documentation for:
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/docs)