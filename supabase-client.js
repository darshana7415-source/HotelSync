// Supabase browser client loader for the StaffSync cloud version.
// Add this script after env.js and the Supabase CDN script.

function createStaffSyncClient() {
  const env = window.STAFFSYNC_ENV || {};

  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_ANON_KEY ||
    env.SUPABASE_URL.includes("your-project-id") ||
    env.SUPABASE_ANON_KEY.includes("your-supabase-anon-key")
  ) {
    throw new Error("Missing Supabase configuration. Copy env.example.js to env.js and fill it in.");
  }

  return window.supabase.createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

try {
  window.staffSyncSupabase = createStaffSyncClient();
  window.staffSyncCloudReady = true;
} catch (error) {
  window.staffSyncCloudReady = false;
  window.staffSyncCloudError = error.message;
}
