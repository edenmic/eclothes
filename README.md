# Second-Hand Marketplace

## 1. Overview
**Application Name:** Second-Hand Marketplace  
**Primary Purpose:** A peer-to-peer web platform for women (and eventually anyone) to buy and sell second-hand items, primarily focusing on clothing for events such as weddings and evening occasions.  
**Target Audience:** Global users of all ages, particularly interested in special-event clothing.

## 2. Core Features & Requirements
### User Accounts
**Sign In / Sign Up**  
- Handled via Firebase or Supabase Authentication.  
- Email/password authentication.  
- Potential for social logins in future (optional).  

**Profile Management**  
- Name, city, contact number, bio, location, profile picture.  
- Measurements: height, size (dress size, shoe size, etc.).  
- Ratings (users can be rated after transactions or interactions).  

### Item Listings
**Categories**  
- Predefined categories (e.g., Casual Dresses, Evening Gowns, Accessories, etc.).  
- System-defined tags (e.g., “Vintage,” “Designer,” “Wedding,” etc.).  

**Attributes**  
- Size, brand, color, condition, and any other relevant attributes (e.g., fabric, style).  

**Media**  
- Up to 5 images per listing (no video support at this stage).  

**Pricing**  
- Users set their own price per item.  

### Search & Filtering
**Search Bar**  
- Keyword-based search (e.g., “blue dress,” “cocktail gown”).  

**Filter Options**  
- Category, size, color, location, price range, brand, condition, etc.  

**Sort Options**  
- By newest listings, price (low-high, high-low).  

### Transactions & Payments
**No In-App Payments**  
- For MVP, buyers and sellers will arrange payment offline (cash on delivery or via direct bank transfer, etc.).  

**No Shipping Integration**  
- Shipping is handled personally between buyer and seller.  

### User Communication
**Contact via Phone**  
- Phone number is displayed on the seller’s profile or item listing for direct communication.  

**Reviews & Ratings**  
- After a successful transaction or interaction, users can leave a rating/review.  

### Admin / Management
**No Dedicated Admin Interface**  
- Administrative actions (e.g., removing inappropriate listings, blocking users) will be done directly on the database for now.  

### UI & Styling
- **Frontend Framework:** React + Vite  
- **UI Library:** Shadcn UI  
- **Responsive Design** for desktop and mobile browsers (no separate mobile app yet).  

## 3. High-Level Architecture
### 3.1 Application Layers
#### Frontend (Client)
- React (with Vite) + Shadcn UI for a modern, modular, and fast development environment.  
- Communicates with Supabase via REST or GraphQL-like API (Supabase offers a PostgREST API for PostgreSQL).  
- Handles UI rendering, client-side routing, form submissions, and state management (e.g., React Query or Redux if needed).  

#### Backend / Database
- **Supabase (PostgreSQL)**  
- Authentication handled by Supabase or Firebase.  
- User data, items, categories, tags, reviews, and ratings stored in SQL tables.  
- **Serverless or Minimal Server:** Supabase provides auto-generated APIs, but a lightweight Node.js/Express server can be added for additional business logic.  

### 3.2 User Flow Diagram (High-Level)
```text
  ┌────────────────────────┐
  │        Web Client      │
  │ (React, Shadcn UI)     │
  └─────────┬──────────────┘
            │
  ┌─────────▼───────────┐
  │   Supabase Auth      │
  │ (Handles sign in/up) │
  └─────────┬────────────┘
            │
  ┌─────────▼───────────┐
  │  Supabase Database   │
  │ (PostgreSQL)         │
  └──────────────────────┘
```

## 4. Detailed Feature List
### 4.1 User Management
- **Registration:** Email/password authentication with optional phone number.  
- **Profile:** View and edit personal info, profile picture, item listings, ratings.  

### 4.2 Item Listings
- **Create Listing:** Title, description, category, price, size, condition, brand, color.  
- **Up to 5 images per listing.**  
- **Location-based listings.**  

### 4.3 Search & Filters
- Full-text search for item titles and descriptions.  
- **Filtering Options:** Category, location, size, condition, brand, price range.  
- **Sorting:** Newest listings first, price ascending/descending.  

### 4.4 Reviews & Ratings
- Buyers can leave a rating and text review after transactions.  
- Ratings displayed on seller’s profile.  

### 4.5 Communication
- Seller’s phone number is visible for direct contact.  

### 4.6 Admin Actions
- **Database-Level Admin:** Admins can remove inappropriate listings or deactivate users directly via Supabase.  

## 5. Data Model Overview
### Users Table
```sql
id (UUID) – primary key
email (string) – from Supabase Auth
name (string)
city (string)
contact_number (string)
bio (text)
profile_picture (string) – URL of hosted image
height (integer)
size (string)
rating_average (float)
created_at (timestamp)
updated_at (timestamp)
```
### Items Table
```sql
id (UUID) – primary key
user_id (UUID) – foreign key referencing Users.id
title (string)
description (text)
category (string)
price (decimal)
size (string)
brand (string)
condition (string)
color (string)
location (string)
created_at (timestamp)
updated_at (timestamp)
```
### Reviews Table
```sql
id (UUID) – primary key
reviewer_id (UUID) – references Users.id
reviewee_id (UUID) – references Users.id (the seller)
rating (integer) – e.g., 1 to 5
comment (text)
created_at (timestamp)
```

## 6. Tech Stack Summary
- **Frontend:** React (Vite) + Shadcn UI  
- **Backend:** Supabase (PostgreSQL)  
- **Authentication:** Supabase Auth or Firebase Auth  
- **Hosting:** Vercel or Netlify for frontend, Supabase for backend  

## 7. Next Steps & Milestones
### Week 1-2: Project Setup
- Initialize Supabase project and React app.  
- Configure authentication.  

### Week 2-6: Core Feature Development
- User profiles, item listings, search & filtering.  
- Display seller contact info.  

### Week 6-8: Enhancements
- Reviews & Ratings.  
- Additional filtering and sorting options.  

### Week 8-10: Testing & Deployment
- Unit testing, usability testing.  
- Deploy on Vercel/Netlify.  

## 8. Conclusion
This document outlines the foundation for the Second-Hand Marketplace. By launching an MVP with essential features and iterating based on user feedback, the platform will grow into a sustainable peer-to-peer marketplace for special-event clothing.
