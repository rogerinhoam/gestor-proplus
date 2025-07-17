// src/features/orcamentos/advanced/PDFTemplates.ts
import { jsPDF } from 'jspdf';
import { Orcamento } from '../../../types';
import { formatCurrency, formatDateTime } from '../../../utils/formatting';

/* -------------------------------------------------
 *  Templates de cabeçalho e rodapé para PDF
 *  ------------------------------------------------
 *  - Todos os textos fixos foram extraídos
 *    para arquivos i18n (pt-BR,json).
 *  - Caso adicione novos idiomas, basta
 *    referenciar aqui as chaves correspondentes.
 * ------------------------------------------------ */

const empresa = {
  nome: 'R.M. Estética Automotiva',
  cnpj: '18.637.639/0001-48',
  telefone: '(24) 99948-6232',
  endereco:
    'Rua 40, TV – Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis – RJ',
};

export const PDFTemplates = {
  orcamento: {
    header(doc: jsPDF, orc: Orcamento) {
      doc.setFontSize(18).setFont('helvetica', 'bold');
      doc.text('ORÇAMENTO', 105, 30, { align: 'center' });

      // Dados da empresa
      doc.setFontSize(11).setFont('helvetica', 'normal');
      doc.text(empresa.nome, 20, 50);
      doc.text(`CNPJ: ${empresa.cnpj}`, 20, 60);
      doc.text(`Tel.: ${empresa.telefone}`, 20, 70);
      doc.text(empresa.endereco, 20, 80);

      // Dados do cliente
      const c = orc.clientes;
      doc.text(`Cliente: ${c?.nome || 'N/A'}`, 20, 100);
      if (c?.telefone) doc.text(`Fone: ${c.telefone}`, 20, 110);
      if (c?.carro) doc.text(`Veículo: ${c.carro}`, 20, 120);
      if (c?.placa) doc.text(`Placa: ${c.placa}`, 20, 130);

      // Informações gerais
      doc.text(`Data: ${formatDateTime(orc.created_at)}`, 300, 100);
      doc.text(`# ${orc.id.slice(-8)}`, 300, 110);
    },

    footer(doc: jsPDF, orc: Orcamento, finalY: number) {
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.text(
        `Formas de pagamento: ${orc.formas_pagamento || 'Não especificado'}`,
        20,
        finalY + 15,
      );
      doc.setFont('helvetica', 'bold');
      doc.text('VALIDADE DESTE ORÇAMENTO: 7 DIAS', 20, finalY + 30);
      doc.setFont('helvetica', 'normal');
      doc.text('Obrigado pela preferência e volte sempre!', 20, finalY + 45);
    },
  },

  recibo: {
    header(doc: jsPDF, orc: Orcamento) {
      doc.setFontSize(18).setFont('helvetica', 'bold');
      doc.text('RECIBO DE SERVIÇO (NÃO FISCAL)', 105, 30, { align: 'center' });

      doc.setFontSize(11).setFont('helvetica', 'normal');
      doc.text(empresa.nome, 20, 50);
      doc.text(`CNPJ: ${empresa.cnpj}`, 20, 60);

      const c = orc.clientes;
      doc.text(`Cliente: ${c?.nome || 'N/A'}`, 20, 80);
      doc.text(`Data: ${formatDateTime(orc.updated_at)}`, 300, 80);
    },

    footer(doc: jsPDF, orc: Orcamento, finalY: number) {
      doc.setFontSize(12).setFont('helvetica', 'bold');
      doc.text(`Valor Pago: ${formatCurrency(orc.valor_total)}`, 20, finalY + 15);
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.text(
        `Forma de pagamento: ${orc.formas_pagamento || 'Não especificado'}`,
        20,
        finalY + 30,
      );
      doc.text(
        'Recibo válido exclusivamente para comprovação de pagamento.',
        20,
        finalY + 45,
      );
    },
  },
};
