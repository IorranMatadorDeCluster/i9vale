import axios from 'axios';
import { parseString } from 'xml2js';
import { Imovel, CargaImoveis, ApiResponse } from '../types/imovel';

// Create a promisified version of parseString with options
const parseXml = (xml: string, options?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    parseString(xml, options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

export class ImoveisService {
  private readonly apiUrl = 'https://imob.valuegaia.com.br/integra/midia.ashx?midia=GaiaWebServiceImovel&p=CruSQRkgey%2fb05hr9ZH%2bpJMb9fdN7OLylKeTxGgPKwP8c8hTFUrwStPqKqvWxqHz5jmy2u9lOog%3d';

  /**
   * Fetches real estate data from the external API and converts XML to JSON
   * @returns Promise<ApiResponse> - The parsed real estate data
   */
  async getImoveis(): Promise<ApiResponse> {
    try {
      console.log('Fetching real estate data from external API...');
      
      // Fetch XML data from external API
      const response = await axios.get(this.apiUrl, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Accept': 'application/xml, text/xml',
          'User-Agent': 'ImoveisAPI/1.0'
        }
      });

      if (!response.data) {
        throw new Error('No data received from external API');
      }

      console.log('XML data received, parsing to JSON...');

      // Parse XML to JSON
      const parsedData = await parseXml(response.data, {
        explicitArray: false,
        mergeAttrs: true,
        trim: true,
        normalize: true,
        normalizeTags: false,
        ignoreAttrs: true,
        explicitChildren: false
      }) as CargaImoveis;

      // Extract imoveis array
      const imoveis = this.extractImoveis(parsedData);

      console.log(`Successfully parsed ${imoveis.length} properties`);

      return {
        success: true,
        data: imoveis,
        count: imoveis.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error fetching or parsing real estate data:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        error: `Failed to fetch real estate data: ${errorMessage}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extracts and normalizes the imoveis array from parsed XML data
   * @param parsedData - The parsed XML data
   * @returns Imovel[] - Array of normalized real estate properties
   */
  private extractImoveis(parsedData: CargaImoveis): Imovel[] {
    try {
      const imoveis = parsedData?.Carga?.Imoveis?.Imovel;
      
      if (!imoveis) {
        console.warn('No imoveis found in parsed data');
        return [];
      }

      // Ensure we always have an array, even if there's only one item
      const imoveisArray = Array.isArray(imoveis) ? imoveis : [imoveis];

      // Normalize and validate each property
      return imoveisArray
        .filter(imovel => this.isValidImovel(imovel))
        .map(imovel => this.normalizeImovel(imovel));

    } catch (error) {
      console.error('Error extracting imoveis:', error);
      return [];
    }
  }

  /**
   * Validates if an imovel object has the required basic properties
   * @param imovel - The imovel object to validate
   * @returns boolean - True if valid, false otherwise
   */
  private isValidImovel(imovel: any): boolean {
    return imovel && 
           typeof imovel === 'object' && 
           imovel.CodigoImovel && 
           imovel.TituloImovel;
  }

  /**
   * Normalizes an imovel object to ensure consistent structure
   * @param imovel - The imovel object to normalize
   * @returns Imovel - The normalized imovel object
   */
  private normalizeImovel(imovel: any): Imovel {
    return {
      Filial: imovel.Filial || '',
      CodigoCliente: imovel.CodigoCliente || '',
      CodigoImovel: imovel.CodigoImovel || '',
      CodigoImovelAuxiliar: imovel.CodigoImovelAuxiliar || '',
      DataCadastro: imovel.DataCadastro || '',
      DataAtualizacao: imovel.DataAtualizacao || '',
      DataAtualizacaoImovel: imovel.DataAtualizacaoImovel || '',
      URLGaiaSite: imovel.URLGaiaSite || '',
      TituloImovel: imovel.TituloImovel || '',
      Publicar: imovel.Publicar || '0',
      TipoImovel: imovel.TipoImovel || '',
      SubTipoImovel: imovel.SubTipoImovel || '',
      Finalidade: imovel.Finalidade || '',
      CategoriaImovel: imovel.CategoriaImovel || '',
      Pais: imovel.Pais || '',
      Estado: imovel.Estado || '',
      Cidade: imovel.Cidade || '',
      Bairro: imovel.Bairro || '',
      BairroOficial: imovel.BairroOficial || '',
      Regiao: imovel.Regiao || '',
      Endereco: imovel.Endereco || '',
      Numero: imovel.Numero || '',
      CEP: imovel.CEP || '',
      ComplementoEndereco: imovel.ComplementoEndereco || '',
      PontoReferenciaEndereco: imovel.PontoReferenciaEndereco || '',
      latitude: imovel.latitude || '',
      longitude: imovel.longitude || '',
      NomeCondominio: imovel.NomeCondominio || '',
      NomeEdificio: imovel.NomeEdificio || '',
      StatusComercial: imovel.StatusComercial || '',
      CondominioFechado: imovel.CondominioFechado || '0',
      TipoOferta: imovel.TipoOferta || '1',
      corretor: this.normalizeCorretor(imovel.corretor),
      PublicaValores: imovel.PublicaValores || '0',
      PrecoVenda: imovel.PrecoVenda || '0',
      PrecoMedioM2Venda: imovel.PrecoMedioM2Venda || '0',
      PrecoCondominio: imovel.PrecoCondominio || '0',
      AreaUtil: imovel.AreaUtil || '0',
      AreaTotal: imovel.AreaTotal || '0',
      UnidadeMetrica: imovel.UnidadeMetrica || 'M2',
      PrecisaReforma: imovel.PrecisaReforma || '0',
      PadraoImovel: imovel.PadraoImovel || '',
      PadraoLocalizacao: imovel.PadraoLocalizacao || '',
      Ocupacao: imovel.Ocupacao || '',
      AceitaNegociacao: imovel.AceitaNegociacao || '0',
      AceitaFinanciamento: imovel.AceitaFinanciamento || '0',
      FaceImovel: imovel.FaceImovel || '',
      NumeroAndar: imovel.NumeroAndar || '0',
      PortaoEletronico: imovel.PortaoEletronico || '0',
      Terraco: imovel.Terraco || '0',
      ServicoCozinha: imovel.ServicoCozinha || '0',
      Zelador: imovel.Zelador || '0',
      ArmarioBanheiro: imovel.ArmarioBanheiro || '0',
      ArmarioAreaServico: imovel.ArmarioAreaServico || '0',
      PisoLaminado: imovel.PisoLaminado || '0',
      QtdDormitorios: imovel.QtdDormitorios || '0',
      QtdBanheiros: imovel.QtdBanheiros || '0',
      QtdSalas: imovel.QtdSalas || '0',
      QtdVagasDescobertas: imovel.QtdVagasDescobertas || '0',
      QtdVagas: imovel.QtdVagas || '0',
      QtdAndar: imovel.QtdAndar || '0',
      AnoConstrucao: imovel.AnoConstrucao || '0',
      Observacao: imovel.Observacao || '',
      ArmarioCozinha: imovel.ArmarioCozinha || '0',
      Piscina: imovel.Piscina || '0',
      QuadraPoliEsportiva: imovel.QuadraPoliEsportiva || '0',
      Sauna: imovel.Sauna || '0',
      Varanda: imovel.Varanda || '0',
      Vestiario: imovel.Vestiario || '0',
      AreaServico: imovel.AreaServico || '0',
      Interfone: imovel.Interfone || '0',
      Exclusividade: imovel.Exclusividade || 'Não',
      Fotos: this.normalizeFotos(imovel.Fotos)
    };
  }

  /**
   * Normalizes corretor (realtor) data
   * @param corretor - The corretor object to normalize
   * @returns Corretor - The normalized corretor object
   */
  private normalizeCorretor(corretor: any): any {
    if (!corretor || typeof corretor !== 'object') {
      return {
        nome: '',
        telefone: '',
        celular: '',
        email: '',
        foto: ''
      };
    }

    return {
      nome: corretor.nome || '',
      telefone: corretor.telefone || '',
      celular: corretor.celular || '',
      email: corretor.email || '',
      foto: corretor.foto || ''
    };
  }

  /**
   * Normalizes photos data
   * @param fotos - The fotos object to normalize
   * @returns Object with Foto array
   */
  private normalizeFotos(fotos: any): { Foto: any[] } {
    if (!fotos || !fotos.Foto) {
      return { Foto: [] };
    }

    const fotosArray = Array.isArray(fotos.Foto) ? fotos.Foto : [fotos.Foto];
    
    return {
      Foto: fotosArray.map((foto: any) => ({
        NomeArquivo: foto.NomeArquivo || '',
        FotoTipo: foto.FotoTipo || 'Foto',
        URLArquivo: foto.URLArquivo || '',
        Principal: foto.Principal || '0'
      }))
    };
  }
} 