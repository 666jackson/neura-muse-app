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
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchAllCharacters() {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .order('order_index', { ascending: true })
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

// ---- video (import) ----

// Import an existing video file into the "videos" bucket.
export async function uploadVideo(file, prefix = 'imports/') {
  return uploadAsset('videos', file, prefix);
}

// ---- videos (standalone library) ----
export async function fetchPublicVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_public', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchAllVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertVideo(video) {
  const { data, error } = await supabase
    .from('videos')
    .upsert({ ...video, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVideo(id) {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) throw error;
}

// ---- soundtracks (background music) ----

// Audio files live in the "videos" bucket under an audio/ prefix (no extra bucket to provision).
export async function uploadAudio(file, prefix = 'audio/') {
  return uploadAsset('videos', file, prefix);
}

// The homepage plays the first published soundtrack (lowest order_index).
export async function fetchPublicSoundtrack() {
  const { data, error } = await supabase
    .from('soundtracks')
    .select('*')
    .eq('is_public', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(1);
  if (error) throw error;
  return data && data[0] ? data[0] : null;
}

export async function fetchAllSoundtracks() {
  const { data, error } = await supabase
    .from('soundtracks')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertSoundtrack(track) {
  const { data, error } = await supabase
    .from('soundtracks')
    .upsert({ ...track, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSoundtrack(id) {
  const { error } = await supabase.from('soundtracks').delete().eq('id', id);
  if (error) throw error;
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