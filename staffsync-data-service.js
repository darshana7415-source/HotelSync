// StaffSync data service skeleton.
// This is the bridge that will replace localStorage in the current prototype.

const staffSyncDb = {
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
      .order("employee_code");

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
      if (String(profile.employee_code || "").toLowerCase().includes("-removed-")) return false;
      const code = String(Number(String(profile.employee_code || "").replace(/\D/g, "")));
      return code === normalized;
    }) || null;
  },

  async getStaffLoginPassword(staffProfileId) {
    const { data, error } = await window.staffSyncSupabase
      .from("staff_login_passwords")
      .select("staff_profile_id, password_hash, reset_required")
      .eq("staff_profile_id", staffProfileId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async setStaffLoginPassword({ staffProfileId, passwordHash, resetRequired = false }) {
    const { data, error } = await window.staffSyncSupabase
      .from("staff_login_passwords")
      .upsert({
        staff_profile_id: staffProfileId,
        password_hash: passwordHash,
        reset_required: resetRequired,
        updated_at: new Date().toISOString()
      }, { onConflict: "staff_profile_id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async clearStaffLoginPassword(staffProfileId) {
    const { error } = await window.staffSyncSupabase
      .from("staff_login_passwords")
      .delete()
      .eq("staff_profile_id", staffProfileId);

    if (error) throw error;
  },

  async getShifts() {
    const { data, error } = await window.staffSyncSupabase
      .from("shifts")
      .select("*")
      .eq("is_active", true)
      .order("start_time");

    if (error) throw error;
    return data;
  },

  async getLeaveTypes(hotelId) {
    const { data, error } = await window.staffSyncSupabase
      .from("leave_types")
      .select("id, name")
      .eq("hotel_id", hotelId)
      .order("name");

    if (error) throw error;
    return (data || []).filter((leaveType) => leaveType.name.toLowerCase() !== "annual leave");
  },

  async getLeaveRequests() {
    const { data, error } = await window.staffSyncSupabase
      .from("leave_requests")
      .select(`
        id,
        start_date,
        end_date,
        reason,
        status,
        created_at,
        approved_at,
        leave_types (
          id,
          name
        ),
        staff_profiles (
          id,
          full_name,
          employee_code,
          departments (
            name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async ensureDepartment({ hotelId, departmentName }) {
    const cleanName = departmentName.trim();
    const { data: existing, error: selectError } = await window.staffSyncSupabase
      .from("departments")
      .select("id")
      .eq("hotel_id", hotelId)
      .eq("name", cleanName)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existing) return existing;

    const { data, error } = await window.staffSyncSupabase
      .from("departments")
      .insert({
        hotel_id: hotelId,
        name: cleanName
      })
      .select("id")
      .single();

    if (error) throw error;
    return data;
  },

  async createStaffProfile({ hotelId, employeeCode, fullName, department, jobTitle, leaveBalance, shift, phone }) {
    const { data: existing, error: existingError } = await window.staffSyncSupabase
      .from("staff_profiles")
      .select("id")
      .eq("employee_code", employeeCode)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      throw new Error(`Employee code ${employeeCode} already exists.`);
    }

    const departmentRow = await this.ensureDepartment({
      hotelId,
      departmentName: department
    });

    const { data: appUser, error: userError } = await window.staffSyncSupabase
      .from("app_users")
      .insert({
        hotel_id: hotelId,
        role: "staff",
        status: "active",
        phone: phone || null
      })
      .select("id")
      .single();

    if (userError) throw userError;

    const { data, error } = await window.staffSyncSupabase
      .from("staff_profiles")
      .insert({
        user_id: appUser.id,
        department_id: departmentRow.id,
        employee_code: employeeCode,
        full_name: fullName,
        job_title: jobTitle,
        leave_balance: leaveBalance,
        default_shift_type: shift
      })
      .select("id")
      .single();

    if (error) throw error;
    return data;
  },

  async updateStaffProfile({ staffProfileId, hotelId, employeeCode, fullName, department, jobTitle, leaveBalance, shift, phone }) {
    const departmentRow = await this.ensureDepartment({
      hotelId,
      departmentName: department
    });

    const { data: profileRow, error: profileError } = await window.staffSyncSupabase
      .from("staff_profiles")
      .select("user_id")
      .eq("id", staffProfileId)
      .maybeSingle();

    if (profileError) throw profileError;

    const { data, error } = await window.staffSyncSupabase
      .from("staff_profiles")
      .update({
        department_id: departmentRow.id,
        employee_code: employeeCode,
        full_name: fullName,
        job_title: jobTitle,
        leave_balance: leaveBalance,
        default_shift_type: shift
      })
      .eq("id", staffProfileId)
      .select()
      .single();

    if (error) throw error;

    if (profileRow?.user_id) {
      const { error: userError } = await window.staffSyncSupabase
        .from("app_users")
        .update({ phone: phone || null })
        .eq("id", profileRow.user_id);

      if (userError) throw userError;
    }

    return data;
  },

  async deactivateStaffProfile({ staffProfileId, employeeCode }) {
    const { data: profileRow, error: profileError } = await window.staffSyncSupabase
      .from("staff_profiles")
      .select("user_id, employee_code")
      .eq("id", staffProfileId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profileRow) return;

    const removedCode = `${employeeCode || profileRow.employee_code || "staff"}-removed-${Date.now()}`;
    const { error: staffError } = await window.staffSyncSupabase
      .from("staff_profiles")
      .update({ employee_code: removedCode })
      .eq("id", staffProfileId);

    if (staffError) throw staffError;

    if (profileRow.user_id) {
      const { error: userError } = await window.staffSyncSupabase
        .from("app_users")
        .update({ status: "inactive" })
        .eq("id", profileRow.user_id);

      if (userError) throw userError;
    }
  },

  async updateStaffLeaveBalance({ staffProfileId, leaveBalance }) {
    const { data, error } = await window.staffSyncSupabase
      .from("staff_profiles")
      .update({
        leave_balance: leaveBalance
      })
      .eq("id", staffProfileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAttendanceRecords({ date, startDate, endDate }) {
    const rangeStart = new Date(`${startDate || date}T00:00:00`);
    const rangeEnd = new Date(`${endDate || date}T23:59:59`);
    const { data, error } = await window.staffSyncSupabase
      .from("attendance_records")
      .select(`
        id,
        staff_profile_id,
        clock_in_at,
        clock_out_at,
        status,
        staff_profiles (
          id,
          full_name,
          employee_code,
          departments (
            name
          )
        )
      `)
      .order("clock_in_at", { ascending: false });

    if (error) throw error;
    return (data || []).filter((record) => {
      const clockIn = record.clock_in_at ? new Date(record.clock_in_at) : null;
      const clockOut = record.clock_out_at ? new Date(record.clock_out_at) : null;
      return (clockIn && clockIn >= rangeStart && clockIn <= rangeEnd) ||
        (clockOut && clockOut >= rangeStart && clockOut <= rangeEnd);
    });
  },

  async assignShift({ staffProfileId, shiftId, assignedDate, assignedBy }) {
    const { data, error } = await window.staffSyncSupabase
      .from("shift_assignments")
      .upsert({
        staff_profile_id: staffProfileId,
        shift_id: shiftId,
        assigned_date: assignedDate,
        assigned_by: assignedBy,
        status: shiftId ? "scheduled" : "weekly_off"
      }, {
        onConflict: "staff_profile_id,assigned_date"
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async clockIn({ staffProfileId, shiftAssignmentId, latitude, longitude }) {
    const { data, error } = await window.staffSyncSupabase
      .from("attendance_records")
      .insert({
        staff_profile_id: staffProfileId,
        shift_assignment_id: shiftAssignmentId,
        clock_in_at: new Date().toISOString(),
        clock_in_latitude: latitude,
        clock_in_longitude: longitude,
        status: "present"
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async clockOut({ attendanceRecordId, latitude, longitude }) {
    const { data, error } = await window.staffSyncSupabase
      .from("attendance_records")
      .update({
        clock_out_at: new Date().toISOString(),
        clock_out_latitude: latitude,
        clock_out_longitude: longitude,
        status: "completed"
      })
      .eq("id", attendanceRecordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createLeaveRequest({ staffProfileId, leaveTypeId, startDate, endDate, reason }) {
    const { data, error } = await window.staffSyncSupabase
      .from("leave_requests")
      .insert({
        staff_profile_id: staffProfileId,
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        reason,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLeaveStatus({ leaveRequestId, status, approvedBy }) {
    const { data, error } = await window.staffSyncSupabase
      .from("leave_requests")
      .update({
        status,
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq("id", leaveRequestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLeaveRequest({ leaveRequestId, startDate, endDate, reason, status }) {
    const { data, error } = await window.staffSyncSupabase
      .from("leave_requests")
      .update({
        start_date: startDate,
        end_date: endDate,
        reason,
        status,
        approved_by: null,
        approved_at: null
      })
      .eq("id", leaveRequestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAllLeaveRequests() {
    const { error } = await window.staffSyncSupabase
      .from("leave_requests")
      .delete()
      .not("id", "is", null);

    if (error) throw error;
  },

  async getActivityLogs({ hotelId, targetUserId, limit = 50 }) {
    let query = window.staffSyncSupabase
      .from("activity_logs")
      .select("id, event_type, message, target_user_id, metadata_json, created_at")
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (targetUserId) {
      query = query.eq("target_user_id", targetUserId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async deleteLeaveActivityLogs({ hotelId }) {
    const { error } = await window.staffSyncSupabase
      .from("activity_logs")
      .delete()
      .eq("hotel_id", hotelId)
      .eq("event_type", "Leave");

    if (error) throw error;
  },

  async deleteActivityLogsByIds({ ids }) {
    const cleanIds = (ids || []).filter(Boolean);
    if (!cleanIds.length) return;

    const { error } = await window.staffSyncSupabase
      .from("activity_logs")
      .delete()
      .in("id", cleanIds);

    if (error) throw error;
  },

  async recordLocationPing({ staffProfileId, attendanceRecordId, latitude, longitude, accuracyMeters, locationStatus, floorLabel, zoneLabel }) {
    const payload = {
      staff_profile_id: staffProfileId,
      attendance_record_id: attendanceRecordId,
      latitude,
      longitude,
      accuracy_meters: accuracyMeters,
      location_status: locationStatus || "unknown"
    };

    if (floorLabel) {
      payload.floor_label = floorLabel;
    }
    if (zoneLabel) {
      payload.zone_label = zoneLabel;
    }

    let response = await window.staffSyncSupabase
      .from("location_pings")
      .insert(payload)
      .select()
      .single();

    if (response.error && floorLabel) {
      delete payload.floor_label;
      delete payload.zone_label;
      response = await window.staffSyncSupabase
        .from("location_pings")
        .insert(payload)
        .select()
        .single();
    }

    const { data, error } = response;
    if (error) throw error;
    return data;
  },

  async getLatestLocationPingForStaff(staffProfileId, { attendanceRecordId, sinceIso, untilIso } = {}) {
    let query = window.staffSyncSupabase
      .from("location_pings")
      .select("latitude, longitude, accuracy_meters, location_status, floor_label, zone_label, captured_at")
      .eq("staff_profile_id", staffProfileId)
      .order("captured_at", { ascending: false })
      .limit(1)
    if (attendanceRecordId) {
      query = query.eq("attendance_record_id", attendanceRecordId);
    }
    if (sinceIso) {
      query = query.gte("captured_at", sinceIso);
    }
    if (untilIso) {
      query = query.lte("captured_at", untilIso);
    }
    let response = await query.maybeSingle();

    if (response.error) {
      let fallback = window.staffSyncSupabase
        .from("location_pings")
        .select("latitude, longitude, accuracy_meters, location_status, captured_at")
        .eq("staff_profile_id", staffProfileId)
        .order("captured_at", { ascending: false })
        .limit(1)
      if (attendanceRecordId) {
        fallback = fallback.eq("attendance_record_id", attendanceRecordId);
      }
      if (sinceIso) {
        fallback = fallback.gte("captured_at", sinceIso);
      }
      if (untilIso) {
        fallback = fallback.lte("captured_at", untilIso);
      }
      response = await fallback.maybeSingle();
    }

    const { data, error } = response;
    if (error) throw error;
    return data;
  },

  async getRecentLocationPings({ sinceIso, untilIso, limit = 200 }) {
    let query = window.staffSyncSupabase
      .from("location_pings")
      .select("id, staff_profile_id, attendance_record_id, latitude, longitude, accuracy_meters, location_status, floor_label, zone_label, captured_at")
      .order("captured_at", { ascending: false })
      .limit(limit);

    if (sinceIso) {
      query = query.gte("captured_at", sinceIso);
    }
    if (untilIso) {
      query = query.lte("captured_at", untilIso);
    }

    let response = await query;
    if (response.error) {
      let fallback = window.staffSyncSupabase
        .from("location_pings")
        .select("staff_profile_id, attendance_record_id, latitude, longitude, accuracy_meters, location_status, captured_at")
        .order("captured_at", { ascending: false })
        .limit(limit);

      if (sinceIso) {
        fallback = fallback.gte("captured_at", sinceIso);
      }
      if (untilIso) {
        fallback = fallback.lte("captured_at", untilIso);
      }
      response = await fallback;
    }

    const { data, error } = response;
    if (error) throw error;
    return data || [];
  },

  async deleteLocationPingsForStaffDate({ staffProfileId, sinceIso, untilIso }) {
    let query = window.staffSyncSupabase
      .from("location_pings")
      .delete()
      .eq("staff_profile_id", staffProfileId);

    if (sinceIso) query = query.gte("captured_at", sinceIso);
    if (untilIso) query = query.lte("captured_at", untilIso);

    const { error } = await query;
    if (error) throw error;
  },

  async getDailyRosters({ hotelId, startDate, endDate }) {
    let query = window.staffSyncSupabase
      .from("daily_rosters")
      .select("staff_profile_id, roster_date, shift_name, in_time, out_time, day_status")
      .eq("hotel_id", hotelId)
      .order("roster_date", { ascending: true });

    if (startDate) query = query.gte("roster_date", startDate);
    if (endDate) query = query.lte("roster_date", endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async saveDailyRoster({ hotelId, rosterDate, entries }) {
    const rows = entries.map((entry) => ({
      hotel_id: hotelId,
      staff_profile_id: entry.staffProfileId,
      roster_date: rosterDate,
      shift_name: entry.shift,
      in_time: entry.inTime,
      out_time: entry.outTime,
      day_status: entry.status,
      updated_at: new Date().toISOString()
    }));

    if (!rows.length) return [];

    const { data, error } = await window.staffSyncSupabase
      .from("daily_rosters")
      .upsert(rows, { onConflict: "staff_profile_id,roster_date" })
      .select();

    if (error) throw error;
    return data || [];
  },

  async deleteDailyRosterDate({ hotelId, rosterDate }) {
    const { error } = await window.staffSyncSupabase
      .from("daily_rosters")
      .delete()
      .eq("hotel_id", hotelId)
      .eq("roster_date", rosterDate);

    if (error) throw error;
  },

  async getLeaveMessages({ hotelId, limit = 1000 }) {
    const { data, error } = await window.staffSyncSupabase
      .from("staffsync_leave_messages")
      .select("id, hotel_id, leave_request_id, staff_profile_id, sender_role, label, class_name, message, metadata_json, created_at")
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async addLeaveMessage({ hotelId, leaveRequestId, staffProfileId, senderRole, label, className, message, metadata }) {
    const { data, error } = await window.staffSyncSupabase
      .from("staffsync_leave_messages")
      .insert({
        hotel_id: hotelId,
        leave_request_id: String(leaveRequestId || ""),
        staff_profile_id: staffProfileId || null,
        sender_role: senderRole || "staff",
        label,
        class_name: className,
        message,
        metadata_json: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addActivityLog({ hotelId, actorUserId, targetUserId, eventType, message, metadata }) {
    const { data, error } = await window.staffSyncSupabase
      .from("activity_logs")
      .insert({
        hotel_id: hotelId,
        actor_user_id: actorUserId,
        target_user_id: targetUserId,
        event_type: eventType,
        message,
        metadata_json: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

window.staffSyncDb = staffSyncDb;
