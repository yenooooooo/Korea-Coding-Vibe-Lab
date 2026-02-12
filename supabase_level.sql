-- Add message_count to profiles
alter table profiles 
add column if not exists message_count int default 0;

-- Function to increment message count
create or replace function increment_message_count()
returns trigger as $$
begin
  update profiles
  set message_count = message_count + 1
  where id = new.user_id;
  return new;
end;
$$ language plpgsql;

-- Trigger to run on every new post
create trigger on_post_created
  after insert on posts
  for each row execute procedure increment_message_count();
