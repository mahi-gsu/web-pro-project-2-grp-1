-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(10) CHECK (role IN ('player', 'admin')) DEFAULT 'player' NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Step 3: Create Background Images table
CREATE TABLE IF NOT EXISTS public.background_images (
    image_id SERIAL PRIMARY KEY,
    image_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by_user_id UUID REFERENCES public.users(id)
);

-- Step 4: Create User Preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    default_puzzle_size VARCHAR(10) DEFAULT '4x4',
    preferred_background_image_id INTEGER REFERENCES public.background_images(image_id),
    sound_enabled BOOLEAN DEFAULT TRUE,
    animations_enabled BOOLEAN DEFAULT TRUE
);

-- Step 5: Create Game Statistics table
CREATE TABLE IF NOT EXISTS public.game_stats (
    stat_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    puzzle_size VARCHAR(10) NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    moves_count INTEGER NOT NULL,
    background_image_id INTEGER REFERENCES public.background_images(image_id),
    win_status BOOLEAN NOT NULL,
    game_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Step 6: Insert default background images
INSERT INTO public.background_images (image_name, image_url, is_active) VALUES
('Default', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop', true),
('Nature', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop', true),
('Space', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=400&fit=crop', true),
('Abstract', 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=400&fit=crop', true)
ON CONFLICT DO NOTHING;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON public.game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_date ON public.game_stats(game_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Step 8: Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS Policies for users table
CREATE POLICY "Users can view their own profile or admins can view all" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their own profile or admins can update all" ON public.users
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert users" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete users" ON public.users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Step 10: Create RLS Policies for background_images table
CREATE POLICY "Anyone can view active background images" ON public.background_images
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage background images" ON public.background_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Step 11: Create RLS Policies for user_preferences table
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Step 12: Create RLS Policies for game_stats table
CREATE POLICY "Users can view their own game stats" ON public.game_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game stats" ON public.game_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all game stats" ON public.game_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Step 13: Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, username, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'player')
    );
    
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 14: Create trigger to automatically create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 