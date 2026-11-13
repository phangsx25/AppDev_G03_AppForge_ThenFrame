import { openDB } from "idb";
const db = () =>
  openDB("thenframe-rehearsal-v1", 1, {
    upgrade(d) {
      d.createObjectStore("collections", { keyPath: "id" });
      d.createObjectStore("photos", { keyPath: "id" });
    },
  });
export const demoDB = {
  async all(table) {
    return (await db()).getAll(table);
  },
  async put(table, row) {
    return (await db()).put(table, row);
  },
  async remove(table, id) {
    return (await db()).delete(table, id);
  },
};
// No mock passwords/accounts: explicit role simulation only. Never production auth.
export const demoSession = () =>
  JSON.parse(sessionStorage.getItem("thenframe-demo-role") || "null");
export function setDemoSession(role) {
  const user = role
    ? {
        id: "demo-" + role,
        email: role + "@example.test",
        display_name: "Rehearsal " + role,
        role,
      }
    : null;
  sessionStorage.setItem("thenframe-demo-role", JSON.stringify(user));
  return user;
}
