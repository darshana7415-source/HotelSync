// StaffSync data service
// Complete bridge between app and Supabase

const staffSyncDb = {
  // ============================================================================
  // EXISTING METHODS (kept from original)
  // ============================================================================

  async getCurrentUser() {
    const { data, error } = await window.staffSyncSupabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async signIn(email, password) {
    const { data, error } = await window.staffSyncSupabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await window.staffSyncSupabase.auth.signOut();
    if (error) throw error;
  },

  async getStaffProfiles() {
    const { data, error } = await window.staffSyncSupabase
      .from("staff_profiles")
      .select(`
        id,
        employee_code,
        full_name,
        job_title,
        phone_mac,
        leave_balance,
        default_shift_type,
        departments (
          id,
          name
        ),
        app_users (
          id,
          role,
          status,
          email,
          phone
        )
      `)
      .order("full_name");

    if (error) throw error;
    return data;
  },

  async getStaffProfileByCode(employeeCode) {
    const normalized = String(Number(String(employeeCode || "").replace(/\D/g, "")));
    const { data, error } = await window.staffSyncSupabase
      .from("staff_profiles")
      .select(`
        id,
        employee_code,
        full_name,
        job_title,
        phone_mac,
        leave_balance,
        default_shift_type,
        departments (
          id,
          name
        ),
        app_users (
          id,
          role,
          status,
          email,
          phone
        )
      `);

    if (error) throw error;
    return (data || []).find((profile) => {
      if (profile.app_users?.status === "inactive") return false;
      const code = String(Number(String(profile.employee_code || "").replace(/\D/g, "")));
      return code === normalized;
    }) || null;
  },

  // ============================================================================
  // NEW ENGENIUS LOCATION TRACKING METHODS
  // ============================================================================

  async updateStaffProfilePhoneMac({ staffProfileId, phoneMac }) {
    const { data, error } = await window.staffSyncSupabase
      .from("staff_profiles")
      .update({ 
        phone_mac: phoneMac.toUpperCase()
      })
      .eq("id", staffProfileId)
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  async createAPZoneMapping({ apName, floor, zone }) {
    const { data, error } = await window.staffSyncSupabase
      .from("ap_zone_mapping")
      .insert({
        hotel_id: window.STAFFSYNC_ENV.HOTEL_ID,
        ap_name: apName.toUpperCase(),
        floor: floor,
        zone: zone
      })
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  async getAPZoneMappings() {
    const { data, error } = await window.staffSyncSupabase
      .from("ap_zone_mapping")
      .select("*")
      .eq("hotel_id", window.STAFFSYNC_ENV.HOTEL_ID)
      .order("zone");

    if (error) throw error;
    return data || [];
  },

  async deleteAPZoneMapping(apId) {
    const { error } = await window.staffSyncSupabase
      .from("ap_zone_mapping")
      .delete()
      .eq("id", apId);

    if (error) throw error;
  },

  async getStaffLocations() {
    const { data, error } = await window.staffSyncSupabase
      .from("engenius_client_map")
      .select(`
        id,
        phone_mac,
        ap_name,
        zone,
        floor,
        last_seen,
        staff_profiles(full_name, employee_code, job_title)
      `)
      .eq("hotel_id", window.STAFFSYNC_ENV.HOTEL_ID)
      .order("last_seen", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getStaffByPhoneMac(phoneMac) {
    const { data, error } = await window.staffSyncSupabase
      .from("staff_profiles")
      .select(`
        id,
        employee_code,
        full_name,
        phone_mac,
        job_title
      `)
      .eq("phone_mac", phoneMac.toUpperCase())
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  onEnGeniusLocationUpdate(callback) {
    const subscription = window.staffSyncSupabase
      .from("engenius_client_map")
      .on("*", payload => {
        console.log("[Location Update]", payload);
        callback(payload);
      })
      .subscribe();

    return subscription;
  },

  offEnGeniusLocationUpdate(subscription) {
    if (subscription) {
      window.staffSyncSupabase.removeSubscription(subscription);
    }
  }
};

// Make it globally available
window.staffSyncDb = staffSyncDb;