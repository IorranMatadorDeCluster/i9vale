import { Pool, PoolClient } from 'pg';
import { Imovel } from '../types/imovel';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

export interface SyncResult {
  success: boolean;
  added: number;
  updated: number;
  deleted: number;
  errors: string[];
  timestamp: string;
}

export class DatabaseService {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection on startup
    this.testConnection();
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log('✅ Database connection established successfully');
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      // Don't throw error, just log it
      console.warn('⚠️ Database operations will be disabled');
    }
  }

  /**
   * Get all existing property codes from database
   */
  async getExistingPropertyCodes(): Promise<string[]> {
    try {
      const client = await this.pool.connect();
      try {
        const result = await client.query(
          'SELECT codigo_imovel FROM public.imoveis_vale WHERE ativo = true'
        );
        return result.rows.map(row => row.codigo_imovel);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Failed to get existing property codes:', error);
      return [];
    }
  }

  /**
   * Insert a new property
   */
  async insertProperty(imovel: Imovel): Promise<void> {
    try {
      const client = await this.pool.connect();
      try {
        const query = `
          INSERT INTO public.imoveis_vale (
            codigo_imovel, finalidade, tipo_imovel, cidade, tipo_oferta,
            preco_venda, preco_aluguel, qtd_dormitorios, qtd_suites, area_util,
            bairro, qtd_vagas_cobertas, qtd_banheiros, padrao_imovel, padrao_localizacao,
            ano_construcao, mobiliado, ar_condicionado, piscina, elevador,
            estado, endereco, titulo_imovel, preco_condominio, observacoes,
            ativo, data_cadastro, data_atualizacao, url_site
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
        `;

        const values = this.mapImovelToDatabaseValues(imovel);
        await client.query(query, values);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Failed to insert property ${imovel.CodigoImovel}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing property
   */
  async updateProperty(imovel: Imovel): Promise<void> {
    try {
      const client = await this.pool.connect();
      try {
        const query = `
          UPDATE public.imoveis_vale SET
            finalidade = $2, tipo_imovel = $3, cidade = $4, tipo_oferta = $5,
            preco_venda = $6, preco_aluguel = $7, qtd_dormitorios = $8, qtd_suites = $9, area_util = $10,
            bairro = $11, qtd_vagas_cobertas = $12, qtd_banheiros = $13, padrao_imovel = $14, padrao_localizacao = $15,
            ano_construcao = $16, mobiliado = $17, ar_condicionado = $18, piscina = $19, elevador = $20,
            estado = $21, endereco = $22, titulo_imovel = $23, preco_condominio = $24, observacoes = $25,
            ativo = $26, data_atualizacao = $28, url_site = $29
          WHERE codigo_imovel = $1
        `;

        const values = this.mapImovelToDatabaseValues(imovel);
        await client.query(query, values);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Failed to update property ${imovel.CodigoImovel}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a property (set ativo = false)
   */
  async softDeleteProperty(codigoImovel: string): Promise<void> {
    try {
      const client = await this.pool.connect();
      try {
        await client.query(
          'UPDATE public.imoveis_vale SET ativo = false, data_atualizacao = CURRENT_TIMESTAMP WHERE codigo_imovel = $1',
          [codigoImovel]
        );
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Failed to soft delete property ${codigoImovel}:`, error);
      throw error;
    }
  }

  /**
   * Map Imovel object to database values array
   */
  private mapImovelToDatabaseValues(imovel: Imovel): any[] {
    const enderecoCompleto = this.buildCompleteAddress(imovel);
    const tipoOferta = this.mapTipoOferta(imovel.TipoOferta);
    const finalidade = this.mapFinalidade(imovel.Finalidade);
    const padraoImovel = this.mapPadraoImovel(imovel.PadraoImovel);
    const padraoLocalizacao = this.mapPadraoLocalizacao(imovel.PadraoLocalizacao);

    return [
      imovel.CodigoImovel,
      finalidade,
      imovel.TipoImovel,
      imovel.Cidade,
      tipoOferta,
      this.parseNumeric(imovel.PrecoVenda),
      this.parseNumeric(imovel.PrecoAluguel || '0'),
      this.parseInteger(imovel.QtdDormitorios),
      this.parseInteger(imovel.QtdSuites || '0'),
      this.parseNumeric(imovel.AreaUtil),
      imovel.Bairro || null,
      this.parseInteger(imovel.QtdVagasCobertas || '0'),
      this.parseInteger(imovel.QtdBanheiros),
      padraoImovel,
      padraoLocalizacao,
      this.parseInteger(imovel.AnoConstrucao),
      this.parseBoolean(imovel.Mobiliado || '0'),
      this.parseBoolean(imovel.ArCondicionado || '0'),
      this.parseBoolean(imovel.Piscina),
      this.parseBoolean(imovel.Elevador || '0'),
      imovel.Estado || null,
      enderecoCompleto || null,
      imovel.TituloImovel || null,
      this.parseNumeric(imovel.PrecoCondominio),
      imovel.Observacao || null,
      this.parseBoolean(imovel.Publicar),
      this.parseTimestamp(imovel.DataCadastro),
      this.parseTimestamp(imovel.DataAtualizacao),
      imovel.URLGaiaSite || null
    ];
  }

  /**
   * Builds complete address by concatenating relevant address information
   */
  private buildCompleteAddress(imovel: Imovel): string {
    const addressParts: string[] = [];

    if (imovel.Endereco) addressParts.push(imovel.Endereco);
    if (imovel.Numero) addressParts.push(imovel.Numero);
    if (imovel.ComplementoEndereco) addressParts.push(imovel.ComplementoEndereco);
    if (imovel.Bairro) addressParts.push(imovel.Bairro);
    if (imovel.Cidade) addressParts.push(imovel.Cidade);
    if (imovel.Estado) addressParts.push(imovel.Estado);
    if (imovel.CEP) addressParts.push(`CEP: ${imovel.CEP}`);

    return addressParts.join(', ');
  }

  /**
   * Maps TipoOferta to database format
   */
  private mapTipoOferta(tipoOferta: string): string {
    switch (tipoOferta) {
      case '1': return 'Venda';
      case '2': return 'Aluguel';
      case '3': return 'Venda/Aluguel';
      default: return 'Venda';
    }
  }

  /**
   * Maps Finalidade to database format
   */
  private mapFinalidade(finalidade: string): string {
    switch (finalidade?.toLowerCase()) {
      case 'residencial': return 'Residencial';
      case 'comercial': return 'Comercial';
      case 'industrial': return 'Industrial';
      case 'rural': return 'Rural';
      default: return finalidade || 'Residencial';
    }
  }

  /**
   * Maps PadraoImovel to database format
   */
  private mapPadraoImovel(padraoImovel: string): string | null {
    if (!padraoImovel || padraoImovel === 'Não informado') return null;
    
    switch (padraoImovel.toLowerCase()) {
      case 'alto padrão':
      case 'alto padrao': return 'Alto Padrão';
      case 'médio padrão':
      case 'medio padrao': return 'Médio Padrão';
      case 'padrão':
      case 'padrao': return 'Padrão';
      default: return padraoImovel;
    }
  }

  /**
   * Maps PadraoLocalizacao to database format
   */
  private mapPadraoLocalizacao(padraoLocalizacao: string): string | null {
    if (!padraoLocalizacao || padraoLocalizacao === 'Não informado') return null;
    
    switch (padraoLocalizacao.toLowerCase()) {
      case 'alto padrão':
      case 'alto padrao': return 'Alto Padrão';
      case 'médio padrão':
      case 'medio padrao': return 'Médio Padrão';
      case 'padrão':
      case 'padrao': return 'Padrão';
      default: return padraoLocalizacao;
    }
  }

  /**
   * Parses numeric value for database
   */
  private parseNumeric(value: string): number | null {
    if (!value || value === '0' || value === '0.00') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Parses integer value for database
   */
  private parseInteger(value: string): number | null {
    if (!value || value === '0') return null;
    const num = parseInt(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Parses boolean value for database
   */
  private parseBoolean(value: string): boolean {
    return value === '1' || value === 'true';
  }

  /**
   * Parses timestamp value for database
   */
  private parseTimestamp(value: string): Date | null {
    if (!value) return null;
    
    // Convert DD/MM/YYYY to Date object
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Month is 0-indexed
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    
    // Try to parse as ISO string
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Close database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
} 