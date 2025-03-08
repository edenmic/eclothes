-- Profiles table (extends Supabase auth)
-- This table stores user profile information and links to the built-in auth.users table
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
-- This table stores all the item listings with their details
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
-- This table stores multiple images per item
create table public.item_images (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) on delete cascade,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Reviews table
-- This table stores user reviews and ratings
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  reviewer_id uuid references public.profiles(id),
  reviewee_id uuid references public.profiles(id),
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Trigger to update the 'updated_at' column on items
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_items_updated_at
before update on items
for each row execute procedure update_modified_column();

-- Trigger to update the 'updated_at' column on profiles
create trigger update_profiles_updated_at
before update on profiles
for each row execute procedure update_modified_column();

-- Create RLS (Row Level Security) policies

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.item_images enable row level security;
alter table public.reviews enable row level security;

-- Profiles policies
create policy "Users can view any profile"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Items policies
create policy "Anyone can view items"
  on public.items for select
  to anon, authenticated
  using (true);

create policy "Users can create items"
  on public.items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own items"
  on public.items for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own items"
  on public.items for delete
  to authenticated
  using (auth.uid() = user_id);

-- Item images policies
create policy "Anyone can view item images"
  on public.item_images for select
  to anon, authenticated
  using (true);

create policy "Users can create images for own items"
  on public.item_images for insert
  to authenticated
  with check (auth.uid() = (select user_id from items where id = item_id));

create policy "Users can delete images for own items"
  on public.item_images for delete
  to authenticated
  using (auth.uid() = (select user_id from items where id = item_id));

-- Reviews policies
create policy "Anyone can view reviews"
  on public.reviews for select
  to anon, authenticated
  using (true);

create policy "Users can create reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = reviewer_id);

create policy "Users can update own reviews"
  on public.reviews for update
  to authenticated
  using (auth.uid() = reviewer_id);

create policy "Users can delete own reviews"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = reviewer_id);

-- Functions to calculate and update user ratings
create or replace function calculate_user_rating()
returns trigger as $$
begin
  update profiles
  set rating_average = (
    select coalesce(avg(rating)::numeric(10,2), 0)
    from reviews
    where reviewee_id = NEW.reviewee_id
  )
  where id = NEW.reviewee_id;
  return NEW;
end;
$$ language 'plpgsql';

create trigger update_user_rating
after insert or update or delete on reviews
for each row execute procedure calculate_user_rating();