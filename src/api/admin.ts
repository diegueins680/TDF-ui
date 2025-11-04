import { get, post } from './client';
import type { AdminConsoleView, AuditLogEntry } from './types';

export const AdminApi = {
  seed: () => post<void>('/admin/seed', {}),
  auditLogs: async () => {
    try {
      return await get<AuditLogEntry[]>('/admin/audit');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? '');
      if (message.includes('404')) {
        return [];
      }
      throw error;
    }
  },
  consolePreview: () => get<AdminConsoleView>('/stubs/admin/console'),
};
