import { validateRegistration } from "../lib/validation";
import { check } from "../lib/backend";
export async function registerCustomer(s, details, origin) {
  const invalid = validateRegistration(details);
  if (invalid) throw Error(invalid);
  const data = check(
    await s.auth.signUp({
      email: details.email.trim().toLowerCase(),
      password: details.password,
      options: {
        data: { display_name: details.name.trim() },
        emailRedirectTo: origin + "/account",
      },
    }),
  );
  if (data.user?.identities?.length === 0)
    throw Error(
      "Registration could not be completed. If this email is registered, sign in instead.",
    );
  return data;
}
export async function login(s, { email, password }, admin = false) {
  const data = check(
    await s.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    }),
  );
  if (admin) {
    try {
      const profile = check(
        await s.from("profiles").select("role").eq("id", data.user.id).single(),
      );
      if (profile.role !== "admin")
        throw Error("Administrator access required. Use customer login.");
    } catch (e) {
      await s.auth.signOut();
      throw e;
    }
  }
  return data;
}
