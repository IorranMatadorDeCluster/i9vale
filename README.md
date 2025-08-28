# Imoveis API

A Node.js TypeScript API that fetches real estate data from an external XML source and converts it to JSON format.

## Features

- 🏠 Fetches real estate data from external XML API
- 🔄 Converts XML response to JSON format
- 🛡️ Built with security best practices (Helmet, CORS)
- 📊 Comprehensive error handling and logging
- 🏥 Health check endpoints
- ⚡ Caching headers for better performance
- 📝 TypeScript for type safety

## API Endpoints

### GET `/imoveis`
Retrieves all real estate properties from the external API.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "CodigoImovel": "AP4801",
      "TituloImovel": "Apartamento à Venda, 2 dormitórios, 57 m² - Vila Cardoso - SJCampos/SP",
      "TipoImovel": "Apartamento",
      "PrecoVenda": "350000.00",
      "AreaUtil": "57",
      "QtdDormitorios": "2",
      "corretor": {
        "nome": "Arlete Moreira",
        "telefone": "(12) 98111-7230",
        "email": "arlete@i9vale.com.br"
      },
      "Fotos": {
        "Foto": [
          {
            "NomeArquivo": "d5b11ce91ee7773b6267aa2b65a81f67.jpg",
            "URLArquivo": "https://images.ingaiasites.com.br/d5b11ce91ee7773b6267aa2b65a81f67.jpg",
            "Principal": "1"
          }
        ]
      }
    }
  ],
  "count": 1,
  "timestamp": "2025-01-27T18:41:14.000Z"
}
```

### GET `/health`
Application health check endpoint.

### GET `/imoveis/health`
Specific health check for the imoveis service.

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd imoveis-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Watch Mode (with auto-restart)
```bash
npm run watch
```

## Docker

### Build Options

#### Multi-stage build (recommended for production)
```bash
docker build -t imoveis-api .
```

#### Simple build (alternative for CI/CD)
```bash
docker build -f Dockerfile.simple -t imoveis-api .
```

### Run the container
```bash
docker run -p 3000:3000 imoveis-api
```

### Run with environment variables
```bash
docker run -p 3000:3000 -e PORT=3000 -e ALLOWED_ORIGINS="*" imoveis-api
```

### Using npm scripts
```bash
# Multi-stage build
npm run docker:build

# Simple build
npm run docker:build:simple

# Run container
npm run docker:run
```

### Using Docker Compose
```bash
docker-compose up -d
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `*` |

## Project Structure

```
src/
├── controllers/
│   └── imoveisController.ts    # HTTP request handlers
├── middleware/
│   └── errorHandler.ts         # Error handling middleware
├── routes/
│   └── imoveisRoutes.ts        # Express routes
├── services/
│   └── imoveisService.ts       # Business logic for fetching/parsing data
├── types/
│   └── imovel.ts              # TypeScript interfaces
└── index.ts                   # Application entry point
```

## Data Structure

The API processes real estate data with the following main properties:

- **Basic Info**: Code, title, type, price, area
- **Location**: Address, city, state, coordinates
- **Features**: Bedrooms, bathrooms, parking spaces
- **Realtor**: Contact information for the property agent
- **Photos**: Array of property images with URLs
- **Amenities**: Various property features (pool, gym, etc.)

## Error Handling

The API includes comprehensive error handling:

- Network timeouts (30 seconds)
- XML parsing errors
- Invalid data validation
- Graceful error responses with timestamps

## Performance Features

- **Caching**: 5-minute cache headers for `/imoveis` endpoint
- **Request Logging**: All requests are logged with timing
- **Timeout Protection**: 30-second timeout for external API calls
- **Memory Management**: Proper cleanup and error handling

## Security

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Input Validation**: Type-safe data processing
- **Error Sanitization**: No sensitive data in error responses

## Testing

To test the API:

1. Start the server: `npm run dev`
2. Visit: `http://localhost:3000/imoveis`
3. Check health: `http://localhost:3000/health`

## Dependencies

### Production
- `express`: Web framework
- `axios`: HTTP client for external API calls
- `xml2js`: XML to JSON parsing
- `cors`: Cross-origin resource sharing
- `helmet`: Security middleware

### Development
- `typescript`: TypeScript compiler
- `ts-node`: TypeScript execution
- `nodemon`: Development server with auto-restart
- `@types/*`: TypeScript type definitions

## License

MIT License 