import { ImoveisService } from './imoveisService';
import { DatabaseService, SyncResult } from './databaseService';
import { Imovel } from '../types/imovel';

export class SyncService {
  private imoveisService: ImoveisService;
  private databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.imoveisService = new ImoveisService();
    this.databaseService = databaseService;
  }

  /**
   * Synchronize database with external API data
   * @returns SyncResult with operation details
   */
  async syncDatabase(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      added: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      console.log('🔄 Starting database synchronization...');

      // Step 1: Fetch data from external API
      console.log('📡 Fetching data from external API...');
      const apiResponse = await this.imoveisService.getImoveis();
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(`Failed to fetch data from API: ${apiResponse.error}`);
      }

      const apiImoveis = apiResponse.data;
      console.log(`📊 Received ${apiImoveis.length} properties from API`);

      // Step 2: Get existing properties from database
      console.log('🗄️ Fetching existing properties from database...');
      const existingCodes = await this.databaseService.getExistingPropertyCodes();
      console.log(`🗄️ Found ${existingCodes.length} existing properties in database`);

      // Step 3: Create sets for efficient comparison
      const apiCodes = new Set(apiImoveis.map(imovel => imovel.CodigoImovel));
      const existingCodesSet = new Set(existingCodes);

      // Step 4: Find properties to add, update, and delete
      const toAdd = apiImoveis.filter(imovel => !existingCodesSet.has(imovel.CodigoImovel));
      const toUpdate = apiImoveis.filter(imovel => existingCodesSet.has(imovel.CodigoImovel));
      const toDelete = existingCodes.filter(code => !apiCodes.has(code));

      console.log(`➕ Properties to add: ${toAdd.length}`);
      console.log(`🔄 Properties to update: ${toUpdate.length}`);
      console.log(`🗑️ Properties to delete: ${toDelete.length}`);

      // Step 5: Process deletions (soft delete)
      console.log('🗑️ Processing deletions...');
      for (const codigoImovel of toDelete) {
        try {
          await this.databaseService.softDeleteProperty(codigoImovel);
          result.deleted++;
        } catch (error) {
          const errorMsg = `Failed to delete property ${codigoImovel}: ${error}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Step 6: Process updates
      console.log('🔄 Processing updates...');
      for (const imovel of toUpdate) {
        try {
          await this.databaseService.updateProperty(imovel);
          result.updated++;
        } catch (error) {
          const errorMsg = `Failed to update property ${imovel.CodigoImovel}: ${error}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Step 7: Process additions
      console.log('➕ Processing additions...');
      for (const imovel of toAdd) {
        try {
          await this.databaseService.insertProperty(imovel);
          result.added++;
        } catch (error) {
          const errorMsg = `Failed to add property ${imovel.CodigoImovel}: ${error}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Step 8: Determine success
      result.success = result.errors.length === 0;
      
      console.log(`✅ Synchronization completed successfully!`);
      console.log(`📊 Summary: ${result.added} added, ${result.updated} updated, ${result.deleted} deleted`);
      
      if (result.errors.length > 0) {
        console.warn(`⚠️ ${result.errors.length} errors occurred during synchronization`);
      }

    } catch (error) {
      const errorMsg = `Synchronization failed: ${error}`;
      console.error(errorMsg);
      result.errors.push(errorMsg);
      result.success = false;
    }

    return result;
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    totalProperties: number;
    activeProperties: number;
    lastSync: string | null;
  }> {
    try {
      const existingCodes = await this.databaseService.getExistingPropertyCodes();
      return {
        totalProperties: existingCodes.length,
        activeProperties: existingCodes.length,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get sync stats:', error);
      return {
        totalProperties: 0,
        activeProperties: 0,
        lastSync: null
      };
    }
  }
} 