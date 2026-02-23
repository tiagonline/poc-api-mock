export const propostaSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    status: { type: 'string' },
    cliente: {
      type: 'object',
      properties: { 
        nome: { type: 'string' }, 
        score_credito: { type: 'number' } 
      },
      required: ['nome', 'score_credito']
    },
    veiculo: {
      type: 'object',
      properties: { 
        marca: { type: 'string' }, 
        modelo: { type: 'string' }, 
        ano: { type: 'number' } 
      }
    },
    coberturas: { 
      type: 'array', 
      items: { type: 'string' }, 
      minItems: 1 
    },
    valor_premio: { type: 'number' }
  },
  required: ['id', 'status', 'cliente', 'veiculo', 'coberturas'],
  additionalProperties: false // Estrito: impede campos não mapeados
};