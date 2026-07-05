import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, anonKey);

// ---- characters ----
export async function fetchPublicCharacters() {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchAllCharacters() {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertCharacter(character) {
  const { data, error } = await supabase
    .from('characters')
    .upsert({ ...character, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCharacter(id) {
  const { error } = await supabase.from('characters').delete().eq('id', id);
  if (error) throw error;
}

// ---- storage ----
export async function uploadAsset(bucket, file, prefix = '') {
  const path = prefix + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ---- uploads (fan lab) ----
export async function recordUpload(imageUrl, analysisResult) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('uploads').insert({
    user_id: user ? user.id : null,
    image_url: imageUrl,
    analysis_result: analysisResult
  });
  if (error) throw error;
}

// ---- auth ----
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onAuthChange(cb) {
  return supabase.auth.onAuthStateChange((_event, session) => cb(session));
}