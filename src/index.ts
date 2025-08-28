import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ImoveisRoutes } from './routes/imoveisRoutes';
import { DatabaseService } from './services/databaseService';
import { SyncService } from './services/syncService';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler';

class App {
  private app: express.Application;
  private port: number;
  private databaseService: DatabaseService | null = null;
  private syncService: SyncService | null = null;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.initializeDatabase();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize all middleware
   */
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use(requestLogger);
  }

  /**
   * Initialize database connection
   */
  private initializeDatabase(): void {
    try {
      // Parse database URL
      const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:3089abbe6d0aad9c7e18@n8n_postgres:5432/n8n?sslmode=disable';
      
      // Extract connection details from URL
      const url = new URL(dbUrl);
      const config = {
        host: url.hostname,
        port: parseInt(url.port, 10),
        database: url.pathname.substring(1), // Remove leading slash
        user: url.username,
        password: url.password,
        ssl: url.searchParams.get('sslmode') === 'disable' ? false : true
      };

      console.log('🔌 Initializing database connection...');
      this.databaseService = new DatabaseService(config);
      this.syncService = new SyncService(this.databaseService);
      console.log('✅ Database services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      console.warn('⚠️ Database sync functionality will be disabled');
    }
  }

  /**
   * Initialize all routes
   */
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        service: 'imoveis-api',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      });
    });

    // API routes
    const imoveisRoutes = new ImoveisRoutes();
    
    // Inject sync service into controller if available
    if (this.syncService) {
      const controller = new (require('./controllers/imoveisController').ImoveisController)();
      controller.setSyncService(this.syncService);
      // Note: This is a simplified approach. In a real app, you'd want proper dependency injection
    }
    
    this.app.use('/imoveis', imoveisRoutes.getRouter());
    
    // SQL endpoint - direct route
    this.app.get('/imoveis-sql', (req, res) => {
      const imoveisController = new (require('./controllers/imoveisController').ImoveisController)();
      imoveisController.getImoveisSql(req, res);
    });

    // Database sync endpoint - direct route
    this.app.post('/db-sync', (req, res) => {
      const imoveisController = new (require('./controllers/imoveisController').ImoveisController)();
      if (this.syncService) {
        imoveisController.setSyncService(this.syncService);
      }
      imoveisController.syncDatabase(req, res);
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        message: 'Imoveis API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          imoveis: '/imoveis',
          'imoveis-health': '/imoveis/health',
          'imoveis-sql': '/imoveis-sql',
          'db-sync': '/db-sync'
        },
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Initialize error handling middleware
   */
  private initializeErrorHandling(): void {
    // 404 handler for undefined routes
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server is running on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`🏠 Imoveis API: http://localhost:${this.port}/imoveis`);
      console.log(`🗄️ SQL Generator: http://localhost:${this.port}/imoveis-sql`);
      console.log(`🔄 Database Sync: http://localhost:${this.port}/db-sync`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    });
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the application
const app = new App();
app.start(); 