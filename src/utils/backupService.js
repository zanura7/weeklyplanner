/**
 * Backup and Restore Service for Weekly Planner
 * Allows users to export/import their data
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase client singleton
let supabaseInstance = null;
const getSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

/**
 * Backup all user data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Backup data object
 */
export const createBackup = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('Creating backup for user:', userId);

  try {
    // Fetch all user data in parallel
    const [
      appointmentsData,
      tasksData,
      metricsData,
      overviewsData
    ] = await Promise.all([
      getSupabase()
        .from('appointments')
        .select('*')
        .eq('user_id', userId),
      getSupabase()
        .from('tasks')
        .select('*')
        .eq('user_id', userId),
      getSupabase()
        .from('metrics')
        .select('*')
        .eq('user_id', userId),
      getSupabase()
        .from('weekly_overviews')
        .select('*')
        .eq('user_id', userId)
    ]);

    // Check for errors
    const errors = [
      appointmentsData.error,
      tasksData.error,
      metricsData.error,
      overviewsData.error
    ].filter(e => e);

    if (errors.length > 0) {
      console.error('Errors fetching backup data:', errors);
      throw new Error('Failed to fetch some data for backup');
    }

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      userId: userId,
      data: {
        appointments: appointmentsData.data || [],
        tasks: tasksData.data || [],
        metrics: metricsData.data || [],
        weeklyOverviews: overviewsData.data || []
      },
      stats: {
        totalAppointments: (appointmentsData.data || []).length,
        totalTasks: (tasksData.data || []).length,
        totalMetrics: (metricsData.data || []).length,
        totalOverviews: (overviewsData.data || []).length
      }
    };

    console.log('Backup created successfully:', backup.stats);
    return backup;

  } catch (error) {
    console.error('Backup creation failed:', error);
    throw error;
  }
};

/**
 * Download backup as JSON file
 * @param {Object} backup - Backup data object
 */
export const downloadBackup = (backup) => {
  try {
    const filename = `weekly-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('Backup downloaded:', filename);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * Read backup file from file input
 * @param {File} file - File object from input
 * @returns {Promise<Object>} Parsed backup data
 */
export const readBackupFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        
        // Validate backup structure
        if (!backup.version || !backup.data) {
          throw new Error('Invalid backup file format');
        }
        
        if (!backup.data.appointments || !backup.data.tasks) {
          throw new Error('Missing required data in backup');
        }
        
        resolve(backup);
      } catch (error) {
        console.error('Failed to parse backup file:', error);
        reject(new Error('Invalid backup file: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Restore data from backup
 * @param {Object} backup - Backup data object
 * @param {string} userId - Current user ID
 * @param {Object} options - Restore options
 * @returns {Promise<Object>} Restore results
 */
export const restoreBackup = async (backup, userId, options = {}) => {
  const {
    overwrite = false,
    skipConflicts = false,
    onProgress = null
  } = options;

  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('Starting restore for user:', userId);
  console.log('Options:', { overwrite, skipConflicts });

  const results = {
    appointments: { created: 0, skipped: 0, errors: 0 },
    tasks: { created: 0, skipped: 0, errors: 0 },
    metrics: { created: 0, skipped: 0, errors: 0 },
    weeklyOverviews: { created: 0, skipped: 0, errors: 0 }
  };

  try {
    // Restore appointments
    if (backup.data.appointments && backup.data.appointments.length > 0) {
      onProgress && onProgress({ step: 1, total: 4, message: 'Restoring appointments...' });
      
      for (const appt of backup.data.appointments) {
        try {
          const { data: existing } = await getSupabase()
            .from('appointments')
            .select('id')
            .eq('user_id', userId)
            .eq('slot_key', appt.slot_key)
            .single();

          if (existing && !overwrite) {
            if (skipConflicts) {
              results.appointments.skipped++;
              continue;
            }
            // Delete existing record
            await getSupabase()
              .from('appointments')
              .delete()
              .eq('id', existing.id);
          }

          const { error } = await getSupabase()
            .from('appointments')
            .upsert({
              user_id: userId,
              slot_key: appt.slot_key,
              week_key: appt.week_key,
              day_index: appt.day_index,
              hour: appt.hour,
              category: appt.category,
              activity_type: appt.activity_type,
              description: appt.description,
              start_time: appt.start_time,
              end_time: appt.end_time,
              custom_id: appt.custom_id,
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
          results.appointments.created++;

        } catch (error) {
          console.error('Error restoring appointment:', appt.slot_key, error);
          results.appointments.errors++;
        }
      }
    }

    // Restore tasks
    if (backup.data.tasks && backup.data.tasks.length > 0) {
      onProgress && onProgress({ step: 2, total: 4, message: 'Restoring tasks...' });
      
      for (const task of backup.data.tasks) {
        try {
          const { data: existing } = await getSupabase()
            .from('tasks')
            .select('id')
            .eq('user_id', userId)
            .eq('day_key', task.day_key)
            .single();

          if (existing && !overwrite) {
            if (skipConflicts) {
              results.tasks.skipped++;
              continue;
            }
            await getSupabase()
              .from('tasks')
              .delete()
              .eq('id', existing.id);
          }

          const { error } = await getSupabase()
            .from('tasks')
            .upsert({
              user_id: userId,
              day_key: task.day_key,
              week_key: task.week_key,
              day_index: task.day_index,
              task_list: task.task_list,
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
          results.tasks.created++;

        } catch (error) {
          console.error('Error restoring task:', task.day_key, error);
          results.tasks.errors++;
        }
      }
    }

    // Restore metrics
    if (backup.data.metrics && backup.data.metrics.length > 0) {
      onProgress && onProgress({ step: 3, total: 4, message: 'Restoring metrics...' });
      
      for (const metric of backup.data.metrics) {
        try {
          const { data: existing } = await getSupabase()
            .from('metrics')
            .select('id')
            .eq('user_id', userId)
            .eq('day_key', metric.day_key)
            .single();

          if (existing && !overwrite) {
            if (skipConflicts) {
              results.metrics.skipped++;
              continue;
            }
            await getSupabase()
              .from('metrics')
              .delete()
              .eq('id', existing.id);
          }

          const { error } = await getSupabase()
            .from('metrics')
            .upsert({
              user_id: userId,
              day_key: metric.day_key,
              week_key: metric.week_key,
              day_index: metric.day_index,
              open_count: metric.open_count,
              present_count: metric.present_count,
              follow_count: metric.follow_count,
              close_count: metric.close_count,
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
          results.metrics.created++;

        } catch (error) {
          console.error('Error restoring metric:', metric.day_key, error);
          results.metrics.errors++;
        }
      }
    }

    // Restore weekly overviews
    if (backup.data.weeklyOverviews && backup.data.weeklyOverviews.length > 0) {
      onProgress && onProgress({ step: 4, total: 4, message: 'Restoring weekly overviews...' });
      
      for (const overview of backup.data.weeklyOverviews) {
        try {
          const { data: existing } = await getSupabase()
            .from('weekly_overviews')
            .select('id')
            .eq('user_id', userId)
            .eq('week_key', overview.week_key)
            .single();

          if (existing && !overwrite) {
            if (skipConflicts) {
              results.weeklyOverviews.skipped++;
              continue;
            }
            await getSupabase()
              .from('weekly_overviews')
              .delete()
              .eq('id', existing.id);
          }

          const { error } = await getSupabase()
            .from('weekly_overviews')
            .upsert({
              user_id: userId,
              week_key: overview.week_key,
              remarks: overview.remarks,
              ai_analysis: overview.ai_analysis,
              analysis_generated_at: overview.analysis_generated_at,
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
          results.weeklyOverviews.created++;

        } catch (error) {
          console.error('Error restoring overview:', overview.week_key, error);
          results.weeklyOverviews.errors++;
        }
      }
    }

    console.log('Restore completed:', results);
    return results;

  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
};

/**
 * Get backup statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics
 */
export const getBackupStats = async (userId) => {
  try {
    const backup = await createBackup(userId);
    return {
      ...backup.stats,
      estimatedSize: JSON.stringify(backup).length,
      lastBackup: backup.timestamp
    };
  } catch (error) {
    console.error('Failed to get backup stats:', error);
    return {
      totalAppointments: 0,
      totalTasks: 0,
      totalMetrics: 0,
      totalOverviews: 0,
      estimatedSize: 0,
      lastBackup: null
    };
  }
};

/**
 * Clear all user data (with confirmation)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deletion results
 */
export const clearAllUserData = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('Clearing all data for user:', userId);

  try {
    const results = {
      appointments: 0,
      tasks: 0,
      metrics: 0,
      weeklyOverviews: 0
    };

    // Delete all data
    const { count: apptCount } = await getSupabase()
      .from('appointments')
      .delete()
      .eq('user_id', userId);
    
    const { count: taskCount } = await getSupabase()
      .from('tasks')
      .delete()
      .eq('user_id', userId);
    
    const { count: metricCount } = await getSupabase()
      .from('metrics')
      .delete()
      .eq('user_id', userId);
    
    const { count: overviewCount } = await getSupabase()
      .from('weekly_overviews')
      .delete()
      .eq('user_id', userId);

    results.appointments = apptCount || 0;
    results.tasks = taskCount || 0;
    results.metrics = metricCount || 0;
    results.weeklyOverviews = overviewCount || 0;

    console.log('All data cleared:', results);
    return results;

  } catch (error) {
    console.error('Failed to clear user data:', error);
    throw error;
  }
};

/**
 * Export data as HTML report
 * @param {Object} backup - Backup data
 * @returns {Promise<string>} HTML content
 */
export const exportToHTML = async (backup) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Planner Report - ${backup.timestamp}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    h1 { color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 1rem; }
    h2 { color: #475569; margin-top: 2rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .stat-card { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #3b82f6; }
    .stat-card h3 { margin: 0; font-size: 0.875rem; color: #64748b; }
    .stat-card p { margin: 0.5rem 0 0; font-size: 1.5rem; font-weight: bold; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; }
    tr:hover { background: #f8fafc; }
    .category-income { background: #d1fae5; }
    .category-servicing { background: #fef3c7; }
    .category-networking { background: #fed7aa; }
    .category-self_dev { background: #bfdbfe; }
    .category-personal { background: #fecaca; }
    .timestamp { color: #64748b; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Weekly Planner Report</h1>
    <p class="timestamp">Generated: ${new Date(backup.timestamp).toLocaleString()}</p>
    
    <div class="stats">
      <div class="stat-card">
        <h3>Appointments</h3>
        <p>${backup.stats.totalAppointments}</p>
      </div>
      <div class="stat-card">
        <h3>Tasks</h3>
        <p>${backup.stats.totalTasks}</p>
      </div>
      <div class="stat-card">
        <h3>Metrics</h3>
        <p>${backup.stats.totalMetrics}</p>
      </div>
      <div class="stat-card">
        <h3>Weekly Overviews</h3>
        <p>${backup.stats.totalOverviews}</p>
      </div>
    </div>

    <h2>Appointments</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Category</th>
          <th>Activity</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${backup.data.appointments.map(appt => `
          <tr>
            <td>${appt.week_key} - ${appt.day_index}</td>
            <td>${appt.start_time} - ${appt.end_time}</td>
            <td class="category-${appt.category}">${appt.category}</td>
            <td>${appt.activity_type}</td>
            <td>${appt.description || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>Tasks</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Tasks</th>
        </tr>
      </thead>
      <tbody>
        ${backup.data.tasks.map(task => `
          <tr>
            <td>${task.day_key}</td>
            <td>${(task.task_list || []).join(', ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>Sales Metrics</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Opens</th>
          <th>Presents</th>
          <th>Follows</th>
          <th>Closes</th>
        </tr>
      </thead>
      <tbody>
        ${backup.data.metrics.map(metric => `
          <tr>
            <td>${metric.day_key}</td>
            <td>${metric.open_count}</td>
            <td>${metric.present_count}</td>
            <td>${metric.follow_count}</td>
            <td>${metric.close_count}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
  `;

  return html;
};
