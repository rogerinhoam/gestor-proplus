// src/features/orcamentos/PDFGenerator.tsx
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Orcamento } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatting';

interface PDFGeneratorProps {
  orcamento: Orcamento;
  type: 'orcamento' | 'recibo';
  onGenerated?: () => void;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  orcamento,
  type,
  onGenerated
}) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Configurações da empresa
    const empresa = {
      nome: "R.M. Estética Automotiva",
      cnpj: "18.637.639/0001-48",
      telefone: "(24) 99948-6232",
      endereco: "Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ"
    };

    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    
    if (type === 'orcamento') {
      doc.text('ORÇAMENTO', 105, 30, { align: 'center' });
    } else {
      doc.text('RECIBO DE SERVIÇO (NÃO FISCAL)', 105, 30, { align: 'center' });
    }

    // Dados da empresa
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(empresa.nome, 20, 50);
    doc.text(`CNPJ: ${empresa.cnpj}`, 20, 60);
    doc.text(`Tel: ${empresa.telefone}`, 20, 70);
    doc.text(empresa.endereco, 20, 80);

    // Linha separadora
    doc.line(20, 90, 190, 90);

    // Dados do cliente
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE:', 20, 105);
    doc.setFont('helvetica', 'normal');
    
    const cliente = orcamento.clientes;
    doc.text(`Nome: ${cliente?.nome || 'N/A'}`, 20, 115);
    if (cliente?.telefone) {
      doc.text(`Telefone: ${cliente.telefone}`, 20, 125);
    }
    if (cliente?.carro) {
      doc.text(`Veículo: ${cliente.carro}`, 20, 135);
    }
    if (cliente?.placa) {
      doc.text(`Placa: ${cliente.placa}`, 20, 145);
    }

    // Data do orçamento/recibo
    doc.text(
      `Data: ${formatDateTime(type === 'orcamento' ? orcamento.created_at : orcamento.updated_at)}`,
      120, 115
    );
    doc.text(`Orçamento #: ${orcamento.id.slice(-8)}`, 120, 125);

    // Tabela de serviços
    const tableData = orcamento.orcamento_itens?.map(item => [
      item.descricao_servico,
      item.quantidade.toString(),
      formatCurrency(item.valor_cobrado),
      formatCurrency(item.valor_cobrado * item.quantidade)
    ]) || [];

    (doc as any).autoTable({
      head: [['Descrição do Serviço', 'Qtd', 'Valor Unit.', 'Total']],
      body: tableData,
      startY: 160,
      theme: 'grid',
      headStyles: {
        fillColor: [33, 128, 141],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      }
    });

    // Cálculos finais
    const subtotal = orcamento.orcamento_itens?.reduce(
      (sum, item) => sum + (item.valor_cobrado * item.quantidade), 0
    ) || 0;
    
    const desconto = (subtotal * (orcamento.desconto || 0)) / 100;
    const total = subtotal - desconto;

    // Posição Y após a tabela
    let finalY = (doc as any).lastAutoTable.finalY + 20;

    // Totais
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 140, finalY);
    
    if (orcamento.desconto && orcamento.desconto > 0) {
      finalY += 10;
      doc.text(`Desconto (${orcamento.desconto}%): -${formatCurrency(desconto)}`, 140, finalY);
    }

    finalY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`TOTAL: ${formatCurrency(total)}`, 140, finalY);

    // Informações de pagamento
    if (orcamento.formas_pagamento) {
      finalY += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Formas de Pagamento: ${orcamento.formas_pagamento}`, 20, finalY);
    }

    // Validade (apenas para orçamentos)
    if (type === 'orcamento') {
      finalY += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('VALIDADE DESTE ORÇAMENTO: 7 DIAS', 20, finalY);
    }

    // Rodapé
    finalY += 25;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Obrigado pela preferência e volte sempre! 👍', 20, finalY);

    // Observações (se houver)
    if (type === 'recibo') {
      finalY += 15;
      doc.text('Recibo válido para fins de comprovação de pagamento.', 20, finalY);
    }

    // Salvar o arquivo
    const fileName = `${type}_${cliente?.nome?.replace(/\s+/g, '_') || 'cliente'}_${orcamento.id.slice(-8)}.pdf`;
    doc.save(fileName);

    if (onGenerated) {
      onGenerated();
    }
  };

  const handleDownload = () => {
    generatePDF();
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
    >
      <i className="fas fa-download mr-2"></i>
      Download {type === 'orcamento' ? 'Orçamento' : 'Recibo'} PDF
    </button>
  );
};
