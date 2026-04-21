import { supabase } from "./client.js";

export async function signUp(
  email: string,
  password: string,
  username: string,
  fullName: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, full_name: fullName } },
  });
  if (error) throw error;
  if (data.user) {
    await supabase
      .from("profiles")
      .insert({ id: data.user.id, username, full_name: fullName });
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}
