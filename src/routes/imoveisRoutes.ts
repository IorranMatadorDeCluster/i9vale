import { Router } from 'express';
import { ImoveisController } from '../controllers/imoveisController';

export class ImoveisRoutes {
  private router: Router;
  private imoveisController: ImoveisController;

  constructor() {
    this.router = Router();
    this.imoveisController = new ImoveisController();
    this.initializeRoutes();
  }

  /**
   * Initialize all routes for the imoveis endpoints
   */
  private initializeRoutes(): void {
    // GET /imoveis - Get all real estate properties
    this.router.get('/', (req, res) => this.imoveisController.getImoveis(req, res));

    // GET /imoveis/health - Health check endpoint
    this.router.get('/health', (req, res) => this.imoveisController.healthCheck(req, res));

    // GET /imoveis-sql - Get SQL INSERT statements
    this.router.get('/sql', (req, res) => this.imoveisController.getImoveisSql(req, res));

    // POST /db-sync - Synchronize database
    this.router.post('/db-sync', (req, res) => this.imoveisController.syncDatabase(req, res));

    // 404 handler for undefined routes under /imoveis
    this.router.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Get the router instance
   * @returns Router - Express router instance
   */
  public getRouter(): Router {
    return this.router;
  }
} 