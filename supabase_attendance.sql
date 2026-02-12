-- 1. Create ATTENDANCE table
create table if not exists attendance (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  check_in_date date not null default current_date,
  vibe_status text check (vibe_status in ('BURNING', 'CHILL', 'DEBUGGING', 'LEARNING')),
  points int default 10,
  created_at timestamptz default now(),
  
  -- Ensure one check-in per day per user
  unique(user_id, check_in_date)
);

-- 2. Add Streak/Point columns to PROFILES
alter table profiles 
add column if not exists current_streak int default 0,
add column if not exists max_streak int default 0,
add column if not exists last_check_in date,
add column if not exists total_points int default 0;

-- 3. Function to handle streak calculation on check-in
create or replace function handle_new_attendance()
returns trigger as $$
declare
  last_date date;
  new_streak int;
begin
  -- Get user's last check-in date from profiles
  select last_check_in into last_date from profiles where id = new.user_id;

  -- Calculate streak
  if last_date = (new.check_in_date - interval '1 day') then
    -- Consecutive day: increment streak
    new_streak := coalesce((select current_streak from profiles where id = new.user_id), 0) + 1;
  else
    -- Missed day or first time: reset to 1
    new_streak := 1;
  end if;

  -- Update profiles
  update profiles
  set 
    current_streak = new_streak,
    max_streak = greatest(max_streak, new_streak),
    last_check_in = new.check_in_date,
    total_points = total_points + new.points
  where id = new.user_id;

  return new;
end;
$$ language plpgsql;

-- 4. Trigger
drop trigger if exists on_attendance_created on attendance;
create trigger on_attendance_created
  after insert on attendance
  for each row execute procedure handle_new_attendance();

-- 5. Enable RLS
alter table attendance enable row level security;

-- Policy: Everyone can read attendance stats (for leaderboard/heatmap)
create policy "Attendance is public" on attendance for select using (true);

-- Policy: Authenticated users can insert their own attendance
create policy "Users can check-in" on attendance for insert with check (auth.uid() = user_id);
