import { Request, Response } from 'express';
import { ImoveisService } from '../services/imoveisService';
import { SqlGeneratorService } from '../services/sqlGeneratorService';
import { SyncService } from '../services/syncService';
import { ApiResponse } from '../types/imovel';

export class ImoveisController {
  private imoveisService: ImoveisService;
  private sqlGeneratorService: SqlGeneratorService;
  private syncService: SyncService | null = null;

  constructor() {
    this.imoveisService = new ImoveisService();
    this.sqlGeneratorService = new SqlGeneratorService();
  }

  /**
   * Set sync service (injected from main app)
   */
  setSyncService(syncService: SyncService): void {
    this.syncService = syncService;
  }

  /**
   * GET /imoveis - Retrieves all real estate properties
   * @param req - Express request object
   * @param res - Express response object
   */
  async getImoveis(req: Request, res: Response): Promise<void> {
    try {
      console.log('GET /imoveis - Request received');
      
      // Add cache control headers
      res.set({
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Content-Type': 'application/json'
      });

      const result: ApiResponse = await this.imoveisService.getImoveis();

      if (result.success) {
        console.log(`GET /imoveis - Successfully returned ${result.count} properties`);
        res.status(200).json(result);
      } else {
        console.error('GET /imoveis - Service returned error:', result.error);
        res.status(500).json(result);
      }

    } catch (error) {
      console.error('GET /imoveis - Unexpected error:', error);
      
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Internal server error occurred while processing the request',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(errorResponse);
    }
  }

  /**
   * GET /imoveis/health - Health check endpoint
   * @param req - Express request object
   * @param res - Express response object
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const healthResponse = {
        status: 'healthy',
        service: 'imoveis-api',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      };

      res.status(200).json(healthResponse);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /imoveis-sql - Retrieves SQL INSERT statements for all properties
   * @param req - Express request object
   * @param res - Express response object
   */
  async getImoveisSql(req: Request, res: Response): Promise<void> {
    try {
      console.log('GET /imoveis-sql - Request received');
      
      // Add cache control headers
      res.set({
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Content-Type': 'application/json'
      });

      const result: ApiResponse = await this.imoveisService.getImoveis();

      if (result.success && result.data) {
        const sqlStatements = this.sqlGeneratorService.generateInsertStatements(result.data);
        
        console.log(`GET /imoveis-sql - Successfully generated ${sqlStatements.length} SQL statements`);

        const sqlResponse = {
          success: true,
          data: sqlStatements,
          count: sqlStatements.length,
          timestamp: new Date().toISOString()
        };

        res.status(200).json(sqlResponse);
      } else {
        console.error('GET /imoveis-sql - Service returned error:', result.error);
        res.status(500).json(result);
      }

    } catch (error) {
      console.error('GET /imoveis-sql - Unexpected error:', error);
      
      const errorResponse = {
        success: false,
        error: 'Internal server error occurred while generating SQL statements',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(errorResponse);
    }
  }

  /**
   * POST /db-sync - Synchronize database with external API data
   * @param req - Express request object
   * @param res - Express response object
   */
  async syncDatabase(req: Request, res: Response): Promise<void> {
    try {
      console.log('POST /db-sync - Request received');
      
      if (!this.syncService) {
        console.error('POST /db-sync - Sync service not available');
        res.status(500).json({
          success: false,
          error: 'Database sync service not available',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Add cache control headers
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      });

      const syncResult = await this.syncService.syncDatabase();
      
      console.log(`POST /db-sync - Synchronization completed: ${syncResult.added} added, ${syncResult.updated} updated, ${syncResult.deleted} deleted`);

      const response = {
        success: syncResult.success,
        data: syncResult,
        timestamp: new Date().toISOString()
      };

      res.status(syncResult.success ? 200 : 207).json(response);

    } catch (error) {
      console.error('POST /db-sync - Unexpected error:', error);
      
      const errorResponse = {
        success: false,
        error: 'Internal server error occurred during database synchronization',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(errorResponse);
    }
  }
} 