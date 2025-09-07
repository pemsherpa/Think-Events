import ExcelSyncService from '../../scripts/excel-sync-service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global sync service instance
let syncService = null;

// Initialize sync service
export const initializeSyncService = (excelFilePath) => {
  if (!syncService) {
    syncService = new ExcelSyncService(excelFilePath);
    console.log('✅ Excel sync service initialized');
  }
  return syncService;
};

// Get sync service instance
export const getSyncService = () => {
  return syncService;
};

// Manual sync endpoint
export const manualSync = async (req, res) => {
  try {
    if (!syncService) {
      return res.status(500).json({
        success: false,
        message: 'Excel sync service not initialized'
      });
    }

    console.log('🔄 Manual sync triggered via API');
    await syncService.importEventsFromExcel();
    
    res.json({
      success: true,
      message: 'Events synced successfully from Excel file'
    });
    
  } catch (error) {
    console.error('❌ Manual sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync events from Excel file',
      error: error.message
    });
  }
};

// Get sync status
export const getSyncStatus = async (req, res) => {
  try {
    if (!syncService) {
      return res.json({
        success: true,
        data: {
          isInitialized: false,
          isWatching: false,
          syncInProgress: false
        }
      });
    }

    res.json({
      success: true,
      data: {
        isInitialized: true,
        isWatching: syncService.isWatching,
        syncInProgress: syncService.syncInProgress,
        excelFilePath: syncService.excelFilePath
      }
    });
    
  } catch (error) {
    console.error('❌ Get sync status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync status',
      error: error.message
    });
  }
};

// Start watching
export const startWatching = async (req, res) => {
  try {
    if (!syncService) {
      return res.status(500).json({
        success: false,
        message: 'Excel sync service not initialized'
      });
    }

    if (syncService.isWatching) {
      return res.json({
        success: true,
        message: 'Excel file is already being watched'
      });
    }

    syncService.startWatching();
    
    res.json({
      success: true,
      message: 'Started watching Excel file for changes'
    });
    
  } catch (error) {
    console.error('❌ Start watching error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start watching Excel file',
      error: error.message
    });
  }
};

// Stop watching
export const stopWatching = async (req, res) => {
  try {
    if (!syncService) {
      return res.status(500).json({
        success: false,
        message: 'Excel sync service not initialized'
      });
    }

    if (!syncService.isWatching) {
      return res.json({
        success: true,
        message: 'Excel file is not currently being watched'
      });
    }

    syncService.stopWatching();
    
    res.json({
      success: true,
      message: 'Stopped watching Excel file for changes'
    });
    
  } catch (error) {
    console.error('❌ Stop watching error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop watching Excel file',
      error: error.message
    });
  }
};
