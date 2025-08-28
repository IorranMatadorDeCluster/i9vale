export interface Corretor {
  nome: string;
  telefone: string;
  celular: string;
  email: string;
  foto: string;
}

export interface Foto {
  NomeArquivo: string;
  FotoTipo: string;
  URLArquivo: string;
  Principal: string;
}

export interface Imovel {
  Filial: string;
  CodigoCliente: string;
  CodigoImovel: string;
  CodigoImovelAuxiliar: string;
  DataCadastro: string;
  DataAtualizacao: string;
  DataAtualizacaoImovel: string;
  URLGaiaSite: string;
  TituloImovel: string;
  Publicar: string;
  TipoImovel: string;
  SubTipoImovel: string;
  Finalidade: string;
  CategoriaImovel: string;
  Pais: string;
  Estado: string;
  Cidade: string;
  Bairro: string;
  BairroOficial: string;
  Regiao: string;
  Endereco: string;
  Numero: string;
  CEP: string;
  ComplementoEndereco: string;
  PontoReferenciaEndereco: string;
  latitude: string;
  longitude: string;
  NomeCondominio: string;
  NomeEdificio: string;
  StatusComercial: string;
  CondominioFechado: string;
  TipoOferta: string;
  corretor: Corretor;
  PublicaValores: string;
  PrecoVenda: string;
  PrecoAluguel?: string;
  PrecoMedioM2Venda: string;
  PrecoCondominio: string;
  AreaUtil: string;
  AreaTotal: string;
  UnidadeMetrica: string;
  PrecisaReforma: string;
  PadraoImovel: string;
  PadraoLocalizacao: string;
  Ocupacao: string;
  AceitaNegociacao: string;
  AceitaFinanciamento: string;
  FaceImovel: string;
  NumeroAndar: string;
  PortaoEletronico: string;
  Terraco: string;
  ServicoCozinha: string;
  Zelador: string;
  ArmarioBanheiro: string;
  ArmarioAreaServico: string;
  PisoLaminado: string;
  QtdDormitorios: string;
  QtdSuites?: string;
  QtdBanheiros: string;
  QtdSalas: string;
  QtdVagasDescobertas: string;
  QtdVagas: string;
  QtdVagasCobertas?: string;
  QtdAndar: string;
  AnoConstrucao: string;
  Observacao: string;
  ArmarioCozinha: string;
  Piscina: string;
  QuadraPoliEsportiva: string;
  Sauna: string;
  Varanda: string;
  Vestiario: string;
  AreaServico: string;
  Interfone: string;
  Exclusividade: string;
  Mobiliado?: string;
  ArCondicionado?: string;
  Elevador?: string;
  Fotos: {
    Foto: Foto[];
  };
}

export interface CargaImoveis {
  Carga: {
    Imoveis: {
      Imovel: Imovel[];
    };
  };
}

export interface ApiResponse {
  success: boolean;
  data?: Imovel[];
  error?: string;
  count?: number;
  timestamp: string;
} 