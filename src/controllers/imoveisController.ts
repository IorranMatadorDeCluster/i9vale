import { Request, Response } from 'express';
import { ImoveisService } from '../services/imoveisService';
import { ApiResponse } from '../types/imovel';

export class ImoveisController {
  private imoveisService: ImoveisService;

  constructor() {
    this.imoveisService = new ImoveisService();
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
} 