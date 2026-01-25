/**
 * Settings Page with Data Management Features
 * Includes backup, restore, and system health monitoring
 */

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Shield, 
  Database, 
  Check,
  AlertTriangle,
  FileText,
  Clock,
  HardDrive,
  Activity
} from 'lucide-react';
import {
  createBackup,
  downloadBackup,
  readBackupFile,
  restoreBackup,
  getBackupStats,
  clearAllUserData,
  exportToHTML
} from './utils/backupService';
import { checkAIServiceHealth, getAIRequestStats } from './api/aiClient';

const SettingsPage = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);
  const [aiHealth, setAiHealth] = useState(null);
  const [restorePreview, setRestorePreview] = useState(null);

  useEffect(() => {
    loadStats();
    checkAIHealth();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getBackupStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const checkAIHealth = async () => {
    try {
      const isHealthy = await checkAIServiceHealth();
      setAiHealth(isHealthy);
    } catch (error) {
      console.error('AI health check failed:', error);
      setAiHealth(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const backup = await createBackup(user.id);
      await downloadBackup(backup);
      setMessage({ 
        type: 'success', 
        text: `Backup created successfully! ${backup.stats.totalAppointments} appointments, ${backup.stats.totalTasks} tasks saved.` 
      });
    } catch (error) {
      console.error('Backup failed:', error);
      setMessage({ 
        type: 'error', 
        text: `Backup failed: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportHTML = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const backup = await createBackup(user.id);
      const html = await exportToHTML(backup);
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `weekly-planner-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ 
        type: 'success', 
        text: 'HTML report exported successfully!' 
      });
    } catch (error) {
      console.error('Export failed:', error);
      setMessage({ 
        type: 'error', 
        text: `Export failed: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage({ type: '', text: 'Reading backup file...' });

    try {
      const backup = await readBackupFile(file);
      
      // Show preview
      setRestorePreview({
        backup,
        stats: {
          appointments: backup.data.appointments?.length || 0,
          tasks: backup.data.tasks?.length || 0,
          metrics: backup.data.metrics?.length || 0,
          overviews: backup.data.weeklyOverviews?.length || 0
        },
        date: backup.timestamp
      });

      setMessage({ 
        type: 'info', 
        text: 'Backup file loaded. Review the data and choose restore option below.' 
      });
    } catch (error) {
      console.error('Failed to read backup:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to read backup file: ${error.message}` 
      });
      setRestorePreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (overwrite = false) => {
    if (!restorePreview) return;

    setLoading(true);
    setMessage({ type: '', text: 'Restoring data...' });

    try {
      const results = await restoreBackup(
        restorePreview.backup,
        user.id,
        { 
          overwrite,
          skipConflicts: !overwrite,
          onProgress: (progress) => {
            setMessage({ 
              type: 'info', 
              text: progress.message 
            });
          }
        }
      );

      const totalCreated = 
        results.appointments.created +
        results.tasks.created +
        results.metrics.created +
        results.weeklyOverviews.created;

      const totalErrors = 
        results.appointments.errors +
        results.tasks.errors +
        results.metrics.errors +
        results.weeklyOverviews.errors;

      setMessage({ 
        type: totalErrors > 0 ? 'warning' : 'success',
        text: `Restore complete! ${totalCreated} items restored${totalErrors > 0 ? `, ${totalErrors} errors` : ''}.` 
      });

      setRestorePreview(null);
      await loadStats();
    } catch (error) {
      console.error('Restore failed:', error);
      setMessage({ 
        type: 'error', 
        text: `Restore failed: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm(
      '⚠️ WARNING: This will DELETE ALL your data including appointments, tasks, metrics, and weekly overviews. This action CANNOT be undone.\n\nAre you absolutely sure you want to continue?'
    )) {
      return;
    }

    if (!window.confirm(
      'This is your last chance to cancel. All data will be permanently deleted. Continue?'
    )) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: 'Clearing all data...' });

    try {
      const results = await clearAllUserData(user.id);
      setMessage({ 
        type: 'success', 
        text: `All data cleared successfully! Deleted ${results.appointments} appointments, ${results.tasks} tasks, ${results.metrics} metrics, and ${results.weeklyOverviews} overviews.` 
      });
      setStats(null);
    } catch (error) {
      console.error('Clear data failed:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to clear data: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Settings & Data</h1>
              <p className="text-xs text-slate-500">Manage your planner data</p>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Back
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Message Banner */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            message.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-start gap-3">
              {message.type === 'success' && <Check className="flex-shrink-0 mt-0.5" size={20} />}
              {message.type === 'error' && <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />}
              {message.type === 'warning' && <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />}
              {message.type === 'info' && <Activity className="flex-shrink-0 mt-0.5" size={20} />}
              <div className="flex-1">
                <p className="font-medium">{message.text}</p>
              </div>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="flex-shrink-0 opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Data Statistics */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Database className="text-blue-500" size={20} />
                Data Statistics
              </h2>
              
              {stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Appointments</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalAppointments}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Tasks</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalTasks}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Metrics</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalMetrics}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Weekly Overviews</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalOverviews}</p>
                  </div>
                  <div className="col-span-2 bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Estimated Size</p>
                    <p className="text-lg font-bold text-slate-900">
                      {(stats.estimatedSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No data available</p>
              )}
            </div>

            {/* System Health */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="text-green-500" size={20} />
                System Health
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">AI Service</span>
                    {aiHealth === null && <RefreshCw className="text-slate-400 animate-spin" size={16} />}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    aiHealth === true ? 'bg-green-100 text-green-700' :
                    aiHealth === false ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {aiHealth === true ? 'Healthy' : aiHealth === false ? 'Down' : 'Checking...'}
                  </span>
                </div>

                <button
                  onClick={checkAIHealth}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  Check Health
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Backup & Export */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Download className="text-blue-500" size={20} />
                Backup & Export
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleBackup}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-bold transition-all active:scale-95"
                >
                  <Download size={18} />
                  {loading ? 'Creating...' : 'Download Backup (JSON)'}
                </button>

                <button
                  onClick={handleExportHTML}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl font-bold transition-all active:scale-95"
                >
                  <FileText size={18} />
                  {loading ? 'Generating...' : 'Export HTML Report'}
                </button>
              </div>
            </div>

            {/* Restore Data */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slabel-900 mb-4 flex items-center gap-2">
                <Upload className="text-purple-500" size={20} />
                Restore Data
              </h2>
              
              {!restorePreview ? (
                <div className="space-y-3">
                  <label className="block">
                    <div className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                      <Upload className="text-slate-400" size={24} />
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">Click to upload backup file</p>
                        <p className="text-xs text-slate-500">JSON files only</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-2">Backup Date</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(restorePreview.date).toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500">Appointments</p>
                      <p className="text-lg font-bold text-blue-700">{restorePreview.stats.appointments}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500">Tasks</p>
                      <p className="text-lg font-bold text-purple-700">{restorePreview.stats.tasks}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500">Metrics</p>
                      <p className="text-lg font-bold text-emerald-700">{restorePreview.stats.metrics}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500">Overviews</p>
                      <p className="text-lg font-bold text-amber-700">{restorePreview.stats.overviews}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleRestore(false)}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg font-bold text-sm transition-all active:scale-95"
                    >
                      <Upload size={16} />
                      {loading ? 'Restoring...' : 'Restore (Skip Conflicts)'}
                    </button>
                    <button
                      onClick={() => handleRestore(true)}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-bold text-sm transition-all active:scale-95"
                    >
                      <RefreshCw size={16} />
                      {loading ? 'Restoring...' : 'Restore (Overwrite)'}
                    </button>
                    <button
                      onClick={() => setRestorePreview(null)}
                      className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-red-200">
              <h2 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                <Trash2 className="text-red-500" size={20} />
                Danger Zone
              </h2>
              
              <button
                onClick={handleClearData}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 p-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-bold transition-all active:scale-95"
              >
                <Trash2 size={18} />
                {loading ? 'Clearing...' : 'Clear All Data'}
              </button>
              <p className="text-xs text-red-600 mt-2 text-center">
                ⚠️ This action cannot be undone
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
