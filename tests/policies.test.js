import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, it, expect, describe } from "vitest";
import { readFileSync } from "node:fs";
let db;
const admin = "00000000-0000-0000-0000-000000000001",
  customer = "00000000-0000-0000-0000-000000000002";
const pub = "10000000-0000-0000-0000-000000000001",
  hidden = "10000000-0000-0000-0000-000000000002";
const visiblePhoto = "20000000-0000-0000-0000-000000000001";
async function as(role, id = "") {
  await db.exec(
    `reset role;set request.jwt.claim.sub='${id}';set role ${role};`,
  );
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth,storage to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 grant select,insert,delete,update on storage.objects to anon,authenticated;
 create function storage.foldername(text) returns text[] language sql as $$select (string_to_array($1,'/'))[1:1]$$;`);
  await db.exec(readFileSync("supabase/migrations/001_sprint1.sql", "utf8"));
  await db.exec(`insert into auth.users values('${admin}','{"display_name":"Admin"}'),('${customer}','{"display_name":"Customer","role":"admin"}');update public.profiles set role='admin' where id='${admin}';
 insert into public.gallery_collections(id,title,description,style,visibility) values('${pub}','Public','Demo','Traditional','public'),('${hidden}','Hidden','Demo','Traditional','hidden');
 insert into public.gallery_photos(id,collection_id,storage_path,visibility) values('${visiblePhoto}','${pub}','${pub}/${visiblePhoto}.png','public'),('20000000-0000-0000-0000-000000000002','${pub}','${pub}/20000000-0000-0000-0000-000000000002.png','hidden'),('20000000-0000-0000-0000-000000000003','${hidden}','${hidden}/20000000-0000-0000-0000-000000000003.png','public');
 insert into storage.objects(bucket_id,name) select 'gallery',storage_path from public.gallery_photos;`);
}, 30000);
afterAll(async () => {
  await db?.close();
});
describe("PostgreSQL RLS execution in PGlite with Supabase auth/storage schema stubs", () => {
  it("signup ignores injected role metadata", async () => {
    await as("authenticated", customer);
    const r = await db.query("select role from public.profiles");
    expect(r.rows).toEqual([{ role: "customer" }]);
  });
  it("customer cannot promote own profile", async () => {
    await as("authenticated", customer);
    await expect(
      db.exec("update public.profiles set role='admin'"),
    ).rejects.toThrow();
  });
  it("anonymous sees only public collection and jointly public photo/storage", async () => {
    await as("anon");
    expect(
      (await db.query("select title from public.gallery_collections")).rows,
    ).toEqual([{ title: "Public" }]);
    expect(
      (await db.query("select id from public.gallery_photos")).rows,
    ).toEqual([{ id: visiblePhoto }]);
    expect(
      (await db.query("select name from storage.objects")).rows,
    ).toHaveLength(1);
  });
  it("customer cannot insert collection or storage object", async () => {
    await as("authenticated", customer);
    await expect(
      db.exec(
        "insert into public.gallery_collections(title,description,style) values('Attack','No','No')",
      ),
    ).rejects.toThrow();
    await expect(
      db.exec(
        `insert into storage.objects(bucket_id,name) values('gallery','${pub}/attack.png')`,
      ),
    ).rejects.toThrow();
  });
  it("customer cannot edit/delete existing gallery rows", async () => {
    await as("authenticated", customer);
    expect(
      (
        await db.query(
          "update public.gallery_collections set title='Attack' returning id",
        )
      ).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("delete from public.gallery_photos returning id")).rows,
    ).toHaveLength(0);
  });
  it("admin sees hidden records and can create/edit/delete", async () => {
    await as("authenticated", admin);
    expect(
      (await db.query("select id from public.gallery_collections")).rows,
    ).toHaveLength(2);
    expect(
      (await db.query("select id from public.gallery_photos")).rows,
    ).toHaveLength(3);
    expect(
      (await db.query("select name from storage.objects")).rows,
    ).toHaveLength(3);
    const r = await db.query(
      "insert into public.gallery_collections(title,description,style) values('New','Demo','Garden') returning id",
    );
    const id = r.rows[0].id;
    await db.query(
      "update public.gallery_collections set title='Edited' where id=$1",
      [id],
    );
    expect(
      (
        await db.query(
          "delete from public.gallery_collections where id=$1 returning title",
          [id],
        )
      ).rows,
    ).toEqual([{ title: "Edited" }]);
  });
  it("hiding a collection revokes anonymous photo and object reads", async () => {
    await as("authenticated", admin);
    await db.query(
      "update public.gallery_collections set visibility='hidden' where id=$1",
      [pub],
    );
    await as("anon");
    expect(
      (await db.query("select id from public.gallery_photos")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("select name from storage.objects")).rows,
    ).toHaveLength(0);
  });
});
