-- Apply once to a fresh Supabase project through SQL Editor or Supabase CLI.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(char_length(display_name) between 1 and 100),
 role text not null default 'customer' check(role in ('customer','admin')),
 created_at timestamptz not null default now()
);
-- Email is referenced through id -> auth.users; never expose an email directory.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name,role) values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Customer'),100),'customer');
 return new;
end;$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin');
$$;
revoke all on function public.handle_new_user() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated;
create table public.gallery_collections(
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(trim(title)) between 1 and 150),
 description text not null check(char_length(trim(description)) between 1 and 3000),
 style text not null check(char_length(trim(style)) between 1 and 80),
 visibility text not null default 'hidden' check(visibility in ('public','hidden')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.gallery_photos(
 id uuid primary key default gen_random_uuid(),
 collection_id uuid not null references public.gallery_collections(id) on delete cascade,
 storage_path text unique not null,
 caption text not null default '' check(char_length(caption)<=500),
 visibility text not null default 'hidden' check(visibility in ('public','hidden')),
 created_at timestamptz not null default now(),
 check(storage_path ~ ('^' || collection_id::text || '/[0-9a-f-]+\.(jpg|png|webp)$'))
);
create index gallery_photos_collection on public.gallery_photos(collection_id);
create function public.touch_collection() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end;$$;
create trigger touch_collection before update on public.gallery_collections for each row execute function public.touch_collection();
alter table public.profiles enable row level security;
alter table public.gallery_collections enable row level security;
alter table public.gallery_photos enable row level security;
revoke all on public.profiles from anon,authenticated;
grant select on public.profiles to authenticated;
-- Roles and profiles cannot be modified through the public API, including by admins.
create policy own_profile on public.profiles for select to authenticated using(id=(select auth.uid()));
grant select on public.gallery_collections,public.gallery_photos to anon,authenticated;
grant insert,update,delete on public.gallery_collections,public.gallery_photos to authenticated;
create policy read_collections on public.gallery_collections for select to anon,authenticated using(visibility='public' or public.is_admin());
create policy manage_collections on public.gallery_collections for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy read_photos on public.gallery_photos for select to anon,authenticated using(public.is_admin() or (visibility='public' and exists(select 1 from public.gallery_collections c where c.id=collection_id and c.visibility='public')));
create policy manage_photos on public.gallery_photos for all to authenticated using(public.is_admin()) with check(public.is_admin());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('gallery','gallery',false,8388608,array['image/jpeg','image/png','image/webp']);
create policy read_gallery_objects on storage.objects for select to anon,authenticated using(bucket_id='gallery' and (public.is_admin() or exists(select 1 from public.gallery_photos p join public.gallery_collections c on c.id=p.collection_id where p.storage_path=name and p.visibility='public' and c.visibility='public')));
create policy insert_gallery_objects on storage.objects for insert to authenticated with check(bucket_id='gallery' and public.is_admin() and exists(select 1 from public.gallery_collections c where c.id::text=(storage.foldername(name))[1]));
create policy delete_gallery_objects on storage.objects for delete to authenticated using(bucket_id='gallery' and public.is_admin());
-- No object UPDATE policy: each upload is a unique immutable path; no overwrite.
commit;
