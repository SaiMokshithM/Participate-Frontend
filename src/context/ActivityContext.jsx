import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as activitiesApi from '@/api/activitiesApi';

const ActivityContext = createContext(null);

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const fetchActivities = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await activitiesApi.getActivities(params);
      // Backend returns a Page object; content holds the array
      setActivities(data.content ?? data);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = useCallback(async (payload) => {
    const created = await activitiesApi.createActivity(payload);
    setActivities(prev => [created, ...prev]);
    return created;
  }, []);

  const updateActivity = useCallback(async (id, payload) => {
    const updated = await activitiesApi.updateActivity(id, payload);
    setActivities(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }, []);

  const deleteActivity = useCallback(async (id) => {
    await activitiesApi.deleteActivity(id);
    setActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <ActivityContext.Provider
      value={{ activities, loading, error, fetchActivities, addActivity, updateActivity, deleteActivity }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivities must be used within ActivityProvider');
  return ctx;
}
