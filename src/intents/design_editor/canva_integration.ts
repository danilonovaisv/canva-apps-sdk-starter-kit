/**
 * =========================================================================
 * Johnny's by Anthonia — Canva Apps SDK Integration
 * Mapeamento e renderização editável seguindo o Design System
 * =========================================================================
 */

import { addPage, initAppElement } from "@canva/design";

/**
 * -------------------------------------------------------------------------
 * CONFIGURAÇÃO DE BRAND KIT & DESIGN TOKENS
 * -------------------------------------------------------------------------
 */
export const BRAND_TOKENS = {
  // Paleta Primária
  AZUL_SUAVE: "#72A7D3",
  ROSA_DOCE: "#FF8FB0",
  CREME: "#FFF4E6",
  AZUL_NUVEM: "#CDE2F3",

  // Paleta Secundária
  AZUL_NOITE: "#0F1B2A",
  CINZA_QUENTE: "#8781A6",
  CINZA_CLARO: "#E6E3DE",
  AZUL_PASTEL: "#A6C8E5",

  // Accents & Washes
  DOURADO: "#D4AF37",
  ROSA_METALICO: "#FFB6C1",
  ROSA_WASH: "#FFE7EE",
  LILAC_WASH: "#ECEAF6",
  PAPER: "#FAF6EE",
};

export const TYPOGRAPHY = {
  fontSans: "Montserrat",
  fontDisplay: "Johnny",
  fontCondensed: "Roboto Condensed",
};

/**
 * -------------------------------------------------------------------------
 * UTILS DE RENDERIZAÇÃO VETORIAL (SVG PATHS LIMPOS)
 * -------------------------------------------------------------------------
 */

/**
 * Retorna o Path SVG para um retângulo arredondado (Rounded Rectangle / Pill)
 */
export function getRoundedRectPath(w: number, h: number, r: number): string {
  // Trata limites de raio
  const radius = Math.min(r, w / 2, h / 2);
  return `M ${radius} 0 H ${w - radius} A ${radius} ${radius} 0 0 1 ${w} ${radius} V ${h - radius} A ${radius} ${radius} 0 0 1 ${w - radius} ${h} H ${radius} A ${radius} ${radius} 0 0 1 0 ${h - radius} V ${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z`;
}

/**
 * Gera um Data URL de moldura/borda dashed 1pt via canvas
 */
export function createDashedBorderDataUrl(
  w: number,
  h: number,
  color: string,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = w * 2; // High-DPI support
  canvas.height = h * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.scale(2, 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  // Offset de meio pixel para borda limpa
  ctx.strokeRect(1, 1, w - 2, h - 2);

  return canvas.toDataURL();
}

/**
 * Retorna o Path de uma estrela sólida
 */
export function getStarPath(cx: number, cy: number, r: number): string {
  return "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
}

/**
 * -------------------------------------------------------------------------
 * 1. REGISTRO E INICIALIZAÇÃO DE ELEMENTOS DE APLICATIVO (initAppElement)
 * -------------------------------------------------------------------------
 */

const g = globalThis as any;

// Tag / Content Badge App Element
export const tagElementClient = g.tagElementClient || (g.tagElementClient = initAppElement<any>({
  render: (data) => {
    const w = 150;
    const h = 32;
    const r = 16; // Pill style

    const tagColors: Record<string, { bg: string; text: string }> = {
      essencial: { bg: BRAND_TOKENS.AZUL_NUVEM, text: BRAND_TOKENS.AZUL_NOITE },
      alugar: { bg: BRAND_TOKENS.LILAC_WASH, text: BRAND_TOKENS.CINZA_QUENTE },
      depois: { bg: BRAND_TOKENS.ROSA_WASH, text: BRAND_TOKENS.ROSA_DOCE },
      dica: { bg: BRAND_TOKENS.AZUL_NOITE, text: BRAND_TOKENS.DOURADO },
      "nao-recomendo": {
        bg: BRAND_TOKENS.CINZA_CLARO,
        text: BRAND_TOKENS.CINZA_QUENTE,
      },
    };

    const colors = (tagColors[data.type] || tagColors.essencial) as {
      bg: string;
      text: string;
    };

    return [
      // Background Pill Shape
      {
        type: "shape",
        paths: [
          {
            d: getRoundedRectPath(w, h, r),
            fill: { color: colors.bg, dropTarget: false },
          },
        ],
        viewBox: { left: 0, top: 0, width: w, height: h },
        top: 0,
        left: 0,
        width: w,
        height: h,
      },
      // Text block inside (fully editable)
      {
        type: "text",
        children: [data.labelText || data.type.toUpperCase()],
        top: 8,
        left: 12,
        width: w - 24,
        fontSize: 10,
        textAlign: "center",
        color: colors.text,
        fontWeight: "semibold",
        fontStyle: "normal",
      },
    ];
  },
}));

// CTA Buy Button App Element
export const buyButtonClient = g.buyButtonClient || (g.buyButtonClient = initAppElement<any>({
  render: (data) => {
    const w = 240;
    const h = 48;
    const r = 24;

    const bg =
      data.accent === "azul" ? BRAND_TOKENS.AZUL_SUAVE : BRAND_TOKENS.ROSA_DOCE;
    const strokeColor =
      data.partnerLevel === "3" ? BRAND_TOKENS.DOURADO : undefined;

    const shapes = [
      {
        d: getRoundedRectPath(w, h, r),
        fill: { color: bg, dropTarget: false },
        stroke: strokeColor
          ? { weight: 2, color: strokeColor, strokeAlign: "inset" as const }
          : undefined,
      },
    ];

    return [
      {
        type: "shape",
        paths: shapes,
        viewBox: { left: 0, top: 0, width: w, height: h },
        top: 0,
        left: 0,
        width: w,
        height: h,
      },
      {
        type: "text",
        children: [data.text || "Comprar agora"],
        top: 15,
        left: 20,
        width: w - 40,
        fontSize: 12,
        textAlign: "center",
        color: "#FFFFFF",
        fontWeight: "bold",
      },
    ];
  },
}));

// Premium Partner Card App Element
export const partnerCardClient = g.partnerCardClient || (g.partnerCardClient = initAppElement<any>({
  render: (data) => {
    const w = 400;
    const h = 550;
    const pad = 24;

    const dashedBorderDataUrl = createDashedBorderDataUrl(
      w - pad * 2,
      80,
      BRAND_TOKENS.DOURADO,
    );

    return [
      // Fundo Card (Azul Noite)
      {
        type: "shape",
        paths: [
          {
            d: getRoundedRectPath(w, h, 20),
            fill: { color: BRAND_TOKENS.AZUL_NOITE, dropTarget: false },
            stroke: {
              weight: 1.5,
              color: BRAND_TOKENS.DOURADO,
              strokeAlign: "inset" as const,
            },
          },
        ],
        viewBox: { left: 0, top: 0, width: w, height: h },
        top: 0,
        left: 0,
        width: w,
        height: h,
      },
      // Header Label (Montserrat)
      {
        type: "text",
        children: ["PARCEIRA PREMIUM"],
        top: pad + 10,
        left: pad,
        width: w - pad * 2,
        fontSize: 10,
        color: BRAND_TOKENS.DOURADO,
        fontWeight: "bold",
        textAlign: "start",
      },
      // Partner Name (Johnny / Roboto Condensed)
      {
        type: "text",
        children: [data.partnerName],
        top: pad + 30,
        left: pad,
        width: w - pad * 2,
        fontSize: 32,
        color: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "start",
      },
      // Partner Description
      {
        type: "text",
        children: [data.description],
        top: pad + 90,
        left: pad,
        width: w - pad * 2,
        fontSize: 13,
        color: BRAND_TOKENS.CREME,
        fontWeight: "normal",
        textAlign: "start",
      },
      // Dashed Coupon Frame (Canvas Placeholder)
      {
        type: "image",
        dataUrl: dashedBorderDataUrl,
        top: 260,
        left: pad,
        width: w - pad * 2,
        height: 80,
        altText: { text: "Cupom dashed border", decorative: true },
      },
      // Coupon text labels inside the frame
      {
        type: "text",
        children: ["CUPOM EXCLUSIVO"],
        top: 275,
        left: pad + 20,
        width: w - pad * 2 - 40,
        fontSize: 10,
        color: BRAND_TOKENS.CINZA_QUENTE,
        fontWeight: "semibold",
        textAlign: "center",
      },
      {
        type: "text",
        children: [data.code],
        top: 295,
        left: pad + 20,
        width: w - pad * 2 - 40,
        fontSize: 20,
        color: BRAND_TOKENS.DOURADO,
        fontWeight: "bold",
        textAlign: "center",
      },
      // Buy Button Base (Shape Background)
      {
        type: "shape",
        paths: [
          {
            d: getRoundedRectPath(w - pad * 2, 48, 24),
            fill: { color: BRAND_TOKENS.ROSA_DOCE, dropTarget: false },
          },
        ],
        viewBox: { left: 0, top: 0, width: w - pad * 2, height: 48 },
        top: 380,
        left: pad,
        width: w - pad * 2,
        height: 48,
      },
      // Buy Button Text label
      {
        type: "text",
        children: ["COMPRAR COM CUPOM"],
        top: 395,
        left: pad + 20,
        width: w - pad * 2 - 40,
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "center",
      },
      // Secondary Link Text
      {
        type: "text",
        children: ["Acessar parceiro"],
        top: 450,
        left: pad,
        width: w - pad * 2,
        fontSize: 12,
        color: BRAND_TOKENS.CREME,
        fontWeight: "semibold",
        textAlign: "center",
        decoration: "underline",
      },
    ];
  },
}));

/**
 * -------------------------------------------------------------------------
 * 2. INTEGRAÇÃO DE PÁGINAS E ELEMENTOS NATURAIS (addPage & addElementAtPoint)
 * -------------------------------------------------------------------------
 */

interface TableItem {
  name: string;
  qty?: string;
  tag?: string;
  comment?: string;
  link?: boolean;
}

interface LongTablePageParams {
  title: string;
  intro: string;
  items: TableItem[];
}

/**
 * Adiciona uma página de Tabela Longa estruturada com dados do roteiro JSON
 */
export async function addLongTablePage({
  title,
  intro,
  items,
}: LongTablePageParams): Promise<void> {
  const pageBg = BRAND_TOKENS.CREME;
  const cardBg = "#FFFFFF";

  // Margens de página
  const pageW = 1080;
  const pageH = 1920; // Portrait PDF
  const topMargin = 80;
  const sideMargin = 64;

  const elements: any[] = [
    // Background Shape
    {
      type: "shape",
      paths: [
        {
          d: `M 0 0 H ${pageW} V ${pageH} H 0 Z`,
          fill: { color: pageBg, dropTarget: false },
        },
      ],
      viewBox: { left: 0, top: 0, width: pageW, height: pageH },
      top: 0,
      left: 0,
      width: pageW,
      height: pageH,
    },
    // Page Title
    {
      type: "text",
      children: [title],
      top: topMargin,
      left: sideMargin,
      width: pageW - sideMargin * 2,
      fontSize: 32,
      color: BRAND_TOKENS.AZUL_NOITE,
      fontWeight: "bold",
      textAlign: "start",
    },
    // Page Intro Description
    {
      type: "text",
      children: [intro],
      top: topMargin + 50,
      left: sideMargin,
      width: pageW - sideMargin * 2,
      fontSize: 14,
      color: BRAND_TOKENS.CINZA_QUENTE,
      textAlign: "start",
    },
  ];

  // Renderiza até 6 linhas da tabela de forma otimizada com padding e whitespace
  let currentY = topMargin + 120;
  const rowH = 72;
  const tableW = pageW - sideMargin * 2;

  // Table Container (Papercut White Surface Sheet)
  const itemsToShow = items.slice(0, 10);
  const containerH = itemsToShow.length * rowH + 40;

  elements.push({
    type: "shape",
    paths: [
      {
        d: getRoundedRectPath(tableW, containerH, 20),
        fill: { color: cardBg, dropTarget: false },
        stroke: { weight: 1, color: "#EFE8DA", strokeAlign: "inset" },
      },
    ],
    viewBox: { left: 0, top: 0, width: tableW, height: containerH },
    top: currentY,
    left: sideMargin,
    width: tableW,
    height: containerH,
  });

  currentY += 20; // Padding superior interno da folha

  itemsToShow.forEach((item, index) => {
    const rowY = currentY + index * rowH;
    const isAlternate = index % 2 === 1;
    const rowColor = isAlternate ? BRAND_TOKENS.PAPER : "#FFFFFF";

    // Row Background
    elements.push({
      type: "shape",
      paths: [
        {
          d: getRoundedRectPath(tableW - 20, rowH - 6, 8),
          fill: { color: rowColor, dropTarget: false },
        },
      ],
      viewBox: { left: 0, top: 0, width: tableW - 20, height: rowH - 6 },
      top: rowY,
      left: sideMargin + 10,
      width: tableW - 20,
      height: rowH - 6,
    });

    // Left Accent indicator border
    let leftBorderColor;
    if (item.tag === "essencial") leftBorderColor = BRAND_TOKENS.AZUL_SUAVE;
    else if (item.tag === "alugar") leftBorderColor = BRAND_TOKENS.CINZA_QUENTE;
    else if (item.tag === "dica") leftBorderColor = BRAND_TOKENS.DOURADO;

    if (leftBorderColor) {
      elements.push({
        type: "shape",
        paths: [
          {
            d: `M 0 0 H 4 V ${rowH - 6} H 0 Z`,
            fill: { color: leftBorderColor, dropTarget: false },
          },
        ],
        viewBox: { left: 0, top: 0, width: 4, height: rowH - 6 },
        top: rowY,
        left: sideMargin + 12,
        width: 4,
        height: rowH - 6,
      });
    }

    // Editable text: Item name
    elements.push({
      type: "text",
      children: [item.name],
      top: rowY + 12,
      left: sideMargin + 24,
      width: 220,
      fontSize: 12,
      color: BRAND_TOKENS.AZUL_NOITE,
      fontWeight: "semibold",
    });

    // Editable text: Item Qtd
    elements.push({
      type: "text",
      children: [`Qtd: ${item.qty || "—"}`],
      top: rowY + 34,
      left: sideMargin + 24,
      width: 100,
      fontSize: 10,
      color: BRAND_TOKENS.CINZA_QUENTE,
    });

    // Editable text: Comment
    elements.push({
      type: "text",
      children: [item.comment || ""],
      top: rowY + 16,
      left: sideMargin + 260,
      width: tableW - 460,
      fontSize: 11,
      color: BRAND_TOKENS.AZUL_NOITE,
    });

    // Buy Button shape
    if (item.link) {
      const btnW = 120;
      const btnH = 32;
      elements.push({
        type: "shape",
        paths: [
          {
            d: getRoundedRectPath(btnW, btnH, 16),
            fill: { color: BRAND_TOKENS.ROSA_DOCE, dropTarget: false },
          },
        ],
        viewBox: { left: 0, top: 0, width: btnW, height: btnH },
        top: rowY + 15,
        left: sideMargin + tableW - 150,
        width: btnW,
        height: btnH,
      });

      elements.push({
        type: "text",
        children: ["COMPRAR"],
        top: rowY + 23,
        left: sideMargin + tableW - 150,
        width: btnW,
        fontSize: 9,
        color: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "center",
      });
    }
  });

  // Insere a página no Canva
  await addPage({
    title: title || "Lista de Enxoval",
    background: { color: pageBg },
    elements,
  });
}

interface PremiumPartnerSlideParams {
  partnerName: string;
  description: string;
  discount: string;
  code: string;
  link: string;
}

/**
 * Adiciona uma página de Parcerias Premium em Canva Slide (1920x1080)
 */
export async function addPremiumPartnerSlide({
  partnerName,
  description,
  discount,
  code,
  link,
}: PremiumPartnerSlideParams): Promise<void> {
  const pageBg = BRAND_TOKENS.AZUL_NOITE;
  const gold = BRAND_TOKENS.DOURADO;

  const elements: any[] = [
    // Inset gold frame border (Moldura dourada 1pt, inset 10mm/38px)
    {
      type: "shape",
      paths: [
        {
          d: getRoundedRectPath(1920 - 76, 1080 - 76, 8),
          fill: { color: "transparent", dropTarget: false },
          stroke: { weight: 1.5, color: gold, strokeAlign: "inset" as const },
        },
      ],
      viewBox: { left: 0, top: 0, width: 1920 - 76, height: 1080 - 76 },
      top: 38,
      left: 38,
      width: 1920 - 76,
      height: 1080 - 76,
    },
    // Monogram Seal circle
    {
      type: "shape",
      paths: [
        {
          d: getRoundedRectPath(80, 80, 40),
          fill: { color: BRAND_TOKENS.AZUL_NOITE, dropTarget: false },
          stroke: { weight: 1.5, color: gold, strokeAlign: "inset" as const },
        },
      ],
      viewBox: { left: 0, top: 0, width: 80, height: 80 },
      top: 60,
      left: 1780,
      width: 80,
      height: 80,
    },
    {
      type: "text",
      children: ["J'"],
      top: 75,
      left: 1780,
      width: 80,
      fontSize: 28,
      color: gold,
      fontWeight: "bold",
      textAlign: "center",
    },
    // Partner Category Label (Eyebrow)
    {
      type: "text",
      children: ["CAPÍTULO 04 · PARCERIAS PREMIUM"],
      top: 80,
      left: 100,
      width: 800,
      fontSize: 12,
      color: gold,
      fontWeight: "semibold",
      textAlign: "start",
    },
    // Large Brand/Partner Name Title
    {
      type: "text",
      children: [partnerName.toUpperCase()],
      top: 120,
      left: 100,
      width: 800,
      fontSize: 64,
      color: "#FFFFFF",
      fontWeight: "bold",
      textAlign: "start",
    },
    // Description text paragraphs
    {
      type: "text",
      children: [description],
      top: 240,
      left: 100,
      width: 750,
      fontSize: 18,
      color: BRAND_TOKENS.CREME,
      textAlign: "start",
    },
  ];

  // We can add the card element directly onto the slide at the right side
  const cardX = 1050;
  const cardY = 180;
  const cardW = 400;
  const cardH = 500;
  const pad = 24;

  const dashedBorderDataUrl = createDashedBorderDataUrl(
    cardW - pad * 2,
    80,
    gold,
  );

  elements.push(
    // Card box bg
    {
      type: "shape",
      paths: [
        {
          d: getRoundedRectPath(cardW, cardH, 20),
          fill: { color: BRAND_TOKENS.AZUL_NOITE, dropTarget: false },
          stroke: { weight: 1.5, color: gold, strokeAlign: "inset" as const },
        },
      ],
      viewBox: { left: 0, top: 0, width: cardW, height: cardH },
      top: cardY,
      left: cardX,
      width: cardW,
      height: cardH,
    },
    // Gold badge inside card
    {
      type: "shape",
      paths: [
        {
          d: getRoundedRectPath(140, 24, 12),
          fill: { color: gold, dropTarget: false },
        },
      ],
      viewBox: { left: 0, top: 0, width: 140, height: 24 },
      top: cardY + pad,
      left: cardX + pad,
      width: 140,
      height: 24,
    },
    {
      type: "text",
      children: ["DESCONTO EXCLUSIVO"],
      top: cardY + pad + 5,
      left: cardX + pad,
      width: 140,
      fontSize: 8,
      color: BRAND_TOKENS.AZUL_NOITE,
      fontWeight: "bold",
      textAlign: "center",
    },
    // Large discount rate
    {
      type: "text",
      children: [discount],
      top: cardY + pad + 40,
      left: cardX + pad,
      width: cardW - pad * 2,
      fontSize: 48,
      color: "#FFFFFF",
      fontWeight: "bold",
    },
    // Dashed border element
    {
      type: "image",
      dataUrl: dashedBorderDataUrl,
      top: cardY + 160,
      left: cardX + pad,
      width: cardW - pad * 2,
      height: 80,
      altText: { text: "Border coupon", decorative: true },
    },
    // Code text
    {
      type: "text",
      children: ["CÓDIGO DO CUPOM:"],
      top: cardY + 175,
      left: cardX + pad + 20,
      width: cardW - pad * 2 - 40,
      fontSize: 9,
      color: BRAND_TOKENS.CINZA_QUENTE,
      fontWeight: "semibold",
      textAlign: "center",
    },
    {
      type: "text",
      children: [code],
      top: cardY + 195,
      left: cardX + pad + 20,
      width: cardW - pad * 2 - 40,
      fontSize: 22,
      color: gold,
      fontWeight: "bold",
      textAlign: "center",
    },
    // CTA Button
    {
      type: "shape",
      paths: [
        {
          d: getRoundedRectPath(cardW - pad * 2, 54, 27),
          fill: { color: BRAND_TOKENS.ROSA_DOCE, dropTarget: false },
        },
      ],
      viewBox: { left: 0, top: 0, width: cardW - pad * 2, height: 54 },
      top: cardY + 280,
      left: cardX + pad,
      width: cardW - pad * 2,
      height: 54,
    },
    {
      type: "text",
      children: ["USAR CUPOM AGORA"],
      top: cardY + 298,
      left: cardX + pad + 20,
      width: cardW - pad * 2 - 40,
      fontSize: 12,
      color: "#FFFFFF",
      fontWeight: "bold",
      textAlign: "center",
    },
    // Disclaimer note at bottom
    {
      type: "text",
      children: [
        "*Parceria paga. A Anthonia só aceita marcas que usa pessoalmente.",
      ],
      top: cardY + 440,
      left: cardX + pad,
      width: cardW - pad * 2,
      fontSize: 9,
      color: BRAND_TOKENS.CINZA_QUENTE,
      textAlign: "center",
      fontStyle: "italic",
    },
  );

  await addPage({
    title: `${partnerName} Premium Slide`,
    background: { color: pageBg },
    dimensions: { width: 1920, height: 1080 },
    elements,
  });
}
