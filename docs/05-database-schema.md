# Database schema and policies

| Table               | Fields                                                                          | Relationship                                              |
| ------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| profiles            | id UUID PK, display_name, role, created_at                                      | id → auth.users.id; email reference via Auth              |
| gallery_collections | id UUID PK, title, description, style, visibility, created_at, updated_at       | parent of photos                                          |
| gallery_photos      | id UUID PK, collection_id, storage_path UNIQUE, caption, visibility, created_at | collection_id → collections.id, cascade metadata deletion |
| storage.objects     | managed by Supabase                                                             | private gallery bucket; path matches photo.storage_path   |

| Actor              | Profiles         | Public gallery                                       | Hidden gallery | Mutations                                           |
| ------------------ | ---------------- | ---------------------------------------------------- | -------------- | --------------------------------------------------- |
| Visitor            | None             | Public collections and jointly public photos/objects | None           | None                                                |
| Customer           | Own profile only | Same as visitor                                      | None           | None                                                |
| Admin/Photographer | Own profile only | All                                                  | All            | Gallery create/update/delete, storage upload/delete |

Role changes and profile writes are unavailable to browser API users. Admin role comes from a
security-definer helper with fixed search_path, not user-editable metadata. Table RLS plus grants
apply independently of UI checks. The storage bucket enforces 8 MB and JPEG/PNG/WebP MIME limits;
client validation also checks header bytes. Browser validation is not a malware scanner and can be
bypassed by an authorised API client; only trusted admins can upload.

A public collection can contain hidden photos; these are not visible to visitors. An empty public
collection is permitted and displays an empty message. Covers use only the currently visible photo
list. No customer private albums exist in this schema; design separate ownership policies in Sprint 3.
