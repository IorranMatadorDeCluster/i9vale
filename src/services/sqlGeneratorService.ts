import { Imovel } from '../types/imovel';

export class SqlGeneratorService {
  /**
   * Generates SQL INSERT statements for the imoveis_vale table
   * @param imoveis - Array of real estate properties
   * @returns Array of SQL INSERT statements
   */
  generateInsertStatements(imoveis: Imovel[]): string[] {
    return imoveis.map(imovel => this.generateInsertStatement(imovel));
  }

  /**
   * Generates a single SQL INSERT statement for an imovel
   * @param imovel - Real estate property
   * @returns SQL INSERT statement
   */
  private generateInsertStatement(imovel: Imovel): string {
    const enderecoCompleto = this.buildCompleteAddress(imovel);
    const tipoOferta = this.mapTipoOferta(imovel.TipoOferta);
    const finalidade = this.mapFinalidade(imovel.Finalidade);
    const padraoImovel = this.mapPadraoImovel(imovel.PadraoImovel);
    const padraoLocalizacao = this.mapPadraoLocalizacao(imovel.PadraoLocalizacao);

    return `INSERT INTO "public"."imoveis_vale" (
  "codigo_imovel",
  "finalidade",
  "tipo_imovel",
  "cidade",
  "tipo_oferta",
  "preco_venda",
  "preco_aluguel",
  "qtd_dormitorios",
  "qtd_suites",
  "area_util",
  "bairro",
  "qtd_vagas_cobertas",
  "qtd_banheiros",
  "padrao_imovel",
  "padrao_localizacao",
  "ano_construcao",
  "mobiliado",
  "ar_condicionado",
  "piscina",
  "elevador",
  "estado",
  "endereco",
  "titulo_imovel",
  "preco_condominio",
  "observacoes",
  "ativo",
  "data_cadastro",
  "data_atualizacao",
  "url_site"
) VALUES (
  '${this.escapeSqlString(imovel.CodigoImovel)}',
  ${finalidade ? `'${this.escapeSqlString(finalidade)}'` : 'NULL'},
  '${this.escapeSqlString(imovel.TipoImovel)}',
  '${this.escapeSqlString(imovel.Cidade)}',
  '${this.escapeSqlString(tipoOferta)}',
  ${this.parseNumeric(imovel.PrecoVenda)},
  ${this.parseNumeric(imovel.PrecoAluguel || '0')},
  ${this.parseInteger(imovel.QtdDormitorios)},
  ${this.parseInteger(imovel.QtdSuites || '0')},
  ${this.parseNumeric(imovel.AreaUtil)},
  ${imovel.Bairro ? `'${this.escapeSqlString(imovel.Bairro)}'` : 'NULL'},
  ${this.parseInteger(imovel.QtdVagasCobertas || '0')},
  ${this.parseInteger(imovel.QtdBanheiros)},
  ${padraoImovel ? `'${this.escapeSqlString(padraoImovel)}'` : 'NULL'},
  ${padraoLocalizacao ? `'${this.escapeSqlString(padraoLocalizacao)}'` : 'NULL'},
  ${this.parseInteger(imovel.AnoConstrucao)},
  ${this.parseBoolean(imovel.Mobiliado || '0')},
  ${this.parseBoolean(imovel.ArCondicionado || '0')},
  ${this.parseBoolean(imovel.Piscina)},
  ${this.parseBoolean(imovel.Elevador || '0')},
  ${imovel.Estado ? `'${this.escapeSqlString(imovel.Estado)}'` : 'NULL'},
  ${enderecoCompleto ? `'${this.escapeSqlString(enderecoCompleto)}'` : 'NULL'},
  ${imovel.TituloImovel ? `'${this.escapeSqlString(imovel.TituloImovel)}'` : 'NULL'},
  ${this.parseNumeric(imovel.PrecoCondominio)},
  ${imovel.Observacao ? `'${this.escapeSqlString(imovel.Observacao)}'` : 'NULL'},
  ${this.parseBoolean(imovel.Publicar)},
  ${this.parseTimestamp(imovel.DataCadastro)},
  ${this.parseTimestamp(imovel.DataAtualizacao)},
  ${imovel.URLGaiaSite ? `'${this.escapeSqlString(imovel.URLGaiaSite)}'` : 'NULL'}
);`;
  }

  /**
   * Builds complete address by concatenating relevant address information
   * @param imovel - Real estate property
   * @returns Complete address string
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
   * @param tipoOferta - Original tipo oferta
   * @returns Mapped tipo oferta
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
   * @param finalidade - Original finalidade
   * @returns Mapped finalidade
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
   * @param padraoImovel - Original padrao imovel
   * @returns Mapped padrao imovel
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
   * @param padraoLocalizacao - Original padrao localizacao
   * @returns Mapped padrao localizacao
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
   * Escapes SQL string to prevent injection
   * @param value - String to escape
   * @returns Escaped string
   */
  private escapeSqlString(value: string): string {
    if (!value) return '';
    return value.replace(/'/g, "''");
  }

  /**
   * Parses numeric value for SQL
   * @param value - String value to parse
   * @returns SQL numeric value or NULL
   */
  private parseNumeric(value: string): string {
    if (!value || value === '0' || value === '0.00') return 'NULL';
    const num = parseFloat(value);
    return isNaN(num) ? 'NULL' : num.toString();
  }

  /**
   * Parses integer value for SQL
   * @param value - String value to parse
   * @returns SQL integer value or NULL
   */
  private parseInteger(value: string): string {
    if (!value || value === '0') return 'NULL';
    const num = parseInt(value);
    return isNaN(num) ? 'NULL' : num.toString();
  }

  /**
   * Parses boolean value for SQL
   * @param value - String value to parse
   * @returns SQL boolean value
   */
  private parseBoolean(value: string): string {
    return value === '1' || value === 'true' ? 'true' : 'false';
  }

  /**
   * Parses timestamp value for SQL
   * @param value - String value to parse
   * @returns SQL timestamp value or NULL
   */
  private parseTimestamp(value: string): string {
    if (!value) return 'NULL';
    
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return `'${year}-${month}-${day}'`;
    }
    
    return `'${value}'`;
  }
} 