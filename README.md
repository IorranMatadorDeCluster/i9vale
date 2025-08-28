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

### GET `/imoveis-sql`
Retrieves SQL INSERT statements for all properties to insert into the `imoveis_vale` database table.

**Response:**
```json
{
  "success": true,
  "data": [
    "INSERT INTO \"public\".\"imoveis_vale\" (\"codigo_imovel\", \"finalidade\", \"tipo_imovel\", \"cidade\", \"tipo_oferta\", \"preco_venda\", \"preco_aluguel\", \"qtd_dormitorios\", \"qtd_suites\", \"area_util\", \"bairro\", \"qtd_vagas_cobertas\", \"qtd_banheiros\", \"padrao_imovel\", \"padrao_localizacao\", \"ano_construcao\", \"mobiliado\", \"ar_condicionado\", \"piscina\", \"elevador\", \"estado\", \"endereco\", \"titulo_imovel\", \"preco_condominio\", \"observacoes\", \"ativo\", \"data_cadastro\", \"data_atualizacao\", \"url_site\") VALUES ('AP4801', 'Residencial', 'Apartamento', 'São José dos Campos', 'Venda', 350000, NULL, 2, NULL, 57, 'Vila Cardoso', NULL, 1, NULL, NULL, 2016, false, false, true, false, 'SP', 'Rua Itororó, 571, 64B    (sol manhã), Vila Cardoso, São José dos Campos, SP, CEP: 12216783', 'Apartamento à Venda, 2 dormitórios, 57 m² - Vila Cardoso - SJCampos/SP', 645, 'Apartamento a Venda ou Locação 02 dormitórios no Residencial Golden Park...', true, '2025-08-24', '2025-08-27 18:41:14', 'https://www.i9vale.com.br/imovel-detalhes.aspx?ref=AP4801');"
  ],
  "count": 1,
  "timestamp": "2025-01-27T18:41:14.000Z"
}
```

### POST `/db-sync`
Synchronizes the database with external API data. Fetches all properties from the external API and performs insert/update/delete operations to keep the database in sync.

**Request:**
```bash
curl -X POST http://localhost:3000/db-sync
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "added": 15,
    "updated": 1890,
    "deleted": 10,
    "errors": [],
    "timestamp": "2025-01-27T18:41:14.000Z"
  },
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
| `DATABASE_URL` | PostgreSQL connection string | `postgres://postgres:3089abbe6d0aad9c7e18@n8n_postgres:5432/n8n?sslmode=disable` |

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
- `pg`: PostgreSQL client for database operations

### Development
- `typescript`: TypeScript compiler
- `ts-node`: TypeScript execution
- `nodemon`: Development server with auto-restart
- `@types/*`: TypeScript type definitions

## License

MIT License 