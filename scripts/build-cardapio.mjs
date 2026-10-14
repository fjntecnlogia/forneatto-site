#!/usr/bin/env node
/**
 * build-cardapio.mjs — o cardápio do Forneatto, o que o QR da mesa abre.
 *
 *   node scripts/build-cardapio.mjs
 *
 * Nasce do painel (a MESMA fonte da carta de vinhos): trocou preço, subiu foto
 * ou desligou prato lá, e o cardapio-vivo.js deixa a página em dia a cada
 * abertura. A página já nasce pronta (HTML, boa no Google).
 *
 * Os vinhos NÃO entram aqui: moram em /vinhos (build-vinhos.mjs), e este
 * cardápio aponta para lá (extras, logo abaixo). Combos também ficam de fora.
 *
 * Painel fora do ar ou resposta magra demais: NÃO escreve nada. O cardápio
 * que já está no ar é melhor que um vazio.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { paginaCardapio, idDe } from './pagina-cardapio.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONTE = 'https://api-painel.fjntecnologia.com.br/public/menu/forneatto';
const MINIMO = 12;   // piso de sanidade: menos que isso é resposta pela metade

const CASA = {
  nome: 'Forneatto Cucina', dominio: 'forneattocucina.com.br', imagens: 'italiano',
  // atalho visivel no topo do cardapio (a pilula de borda verde antes das secoes)
  extras: [{ texto: 'Carta de vinhos', href: '/vinhos' }],
  endereco: 'Av. Brasília, 177 — Bloco A, Lojas 116 e 117 · Cuiabá/MT',
  logo: { src: '/assets/img/logos/web/forneatto-claro.png', alt: 'Forneatto Cucina — Cozinha Italiana', largura: 124, altura: 104 },
  icone: { aba: '/assets/img/icone/forneatto-32.png', inicio: '/assets/img/icone/forneatto-180.png' },
  fontes: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,700&family=Archivo:wght@400;500;600;700&display=swap',
  tema: {
    papel: '#fbf8f1', cartao: '#f2ebdc', tinta: '#17140f', suave: '#6d6659',
    marca: '#c4161c', realce: '#0e3b1e', fio: '#ddd4c2',
    barra: '#fbf8f1', sobreBarra: '#17140f',
    display: '"Bodoni Moda", "Didot", Georgia, serif',
    texto: '"Archivo", -apple-system, sans-serif',
    pesoDisplay: 500, arco: '4px', logoAltura: 104,
  },
};

// A cozinha, na ordem em que a casa a lê: do começo ao fim da refeição.
const COMIDA = ['Antipasti', 'Lasagna', 'Rondelli', 'Cannelloni', 'Gnocchi', 'Risotti', 'Cappelletti', 'Massa Seca', 'Sobremesa'];
const TITULO = { Sobremesa: 'Sobremesas', 'Massa Seca': 'Massa seca' };

// Bebidas: uma seção só, com subtítulos — 15 fichas no topo não ajudam ninguém.
const BEBIDAS = [
  ['Chopp', 'Chopp'], ['Cervejas. 600 ml', 'Cervejas 600 ml'], ['Long Neck', 'Long neck'],
  ['Nao Alcoolicos', 'Sem álcool'], ['Sucos Naturais', 'Sucos naturais'], ['Drinks', 'Drinks'],
  ['Caipirinhas', 'Caipirinhas'], ['Caipiroskas', 'Caipiroskas'], ['Cachaças Doses', 'Cachaças (dose)'],
  ['Whisky Doses', 'Whisky (dose)'], ['Whisky Garrafa', 'Whisky (garrafa)'], ['Vodka', 'Vodka'],
  ['Gin Doses', 'Gin (dose)'], ['Tequila', 'Tequila'], ['Digestivos', 'Digestivos'],
];

const r = await fetch(FONTE, { headers: { Accept: 'application/json' } });
if (!r.ok) throw new Error(`o painel respondeu ${r.status} — cardápio mantido como está`);
const painel = await r.json();
const cat = new Map((painel.categories ?? []).map(c => [c.category, c.items ?? []]));

const ficha = i => ({
  nome: i.name,
  desc: (i.description ?? '').split('|').map(t => t.trim()).filter(Boolean).join(' · ') || null,
  preco: i.price_cents / 100,
  foto: i.image_url ?? null,
});

const secoes = [];
for (const nome of COMIDA) {
  const itens = cat.get(nome);
  if (!itens?.length) continue;
  const titulo = TITULO[nome] ?? nome;
  secoes.push({ id: idDe(titulo), titulo, categoria: nome, itens: itens.map(ficha) });
}
const beb = [];
for (const [nome, rotulo] of BEBIDAS) {
  const itens = cat.get(nome);
  if (!itens?.length) continue;
  beb.push({ divisor: rotulo }, ...itens.map(ficha));
}
if (beb.length) secoes.push({ id: 'bebidas', titulo: 'Bebidas', categoria: 'Bebidas', itens: beb });

const total = secoes.reduce((n, s) => n + s.itens.filter(i => !i.divisor).length, 0);
if (total < MINIMO) throw new Error(`o painel devolveu só ${total} itens (piso ${MINIMO}) — NÃO escrevi nada`);

const BASE = `https://${CASA.dominio}`;
await writeFile(join(RAIZ, 'cardapio.html'), paginaCardapio({
  url: `${BASE}/cardapio`,
  ogImagem: `${BASE}/assets/img/${CASA.imagens}/og.jpg`,
  casa: CASA.nome, titulo: 'Cardápio', endereco: CASA.endereco,
  // O <title> e o og:title (o que o Google e o WhatsApp mostram) dizem o que
  // tem na casa; o titulo curto acima continua sendo o do cabecalho da pagina.
  tituloPagina: 'Cardápio Forneatto — Massas, Risotos e Antipasti | Cuiabá',
  ogLargura: 1200, ogAltura: 630, ogAlt: "O salão do Forneatto Cucina, com limoeiros, a parede de quadros e as mesas postas",
  logo: CASA.logo, icone: CASA.icone,
  descricao: `Cardápio do ${CASA.nome}: antipasti, massas frescas, risotos e sobremesas, com chopp, drinks e bebidas. Cozinha italiana em Cuiabá.`,
  gerador: 'scripts/build-cardapio.mjs',
  fontes: CASA.fontes,
  rodape: 'Preços sujeitos a alteração. Venda de bebida alcoólica proibida para menores de 18 anos.',
  tema: CASA.tema,
  naoIndexar: false,
  apiSlug: 'forneatto',
  extras: CASA.extras,
  secoes,
  jsonld: {
    '@context': 'https://schema.org', '@type': 'Menu', name: `Cardápio — ${CASA.nome}`,
    hasMenuSection: secoes.map(s => ({
      '@type': 'MenuSection', name: s.titulo,
      hasMenuItem: s.itens.filter(i => !i.divisor).map(it => ({
        '@type': 'MenuItem', name: it.nome,
        ...(it.desc ? { description: it.desc } : {}),
        offers: { '@type': 'Offer', price: it.preco.toFixed(2), priceCurrency: 'BRL' },
      })),
    })),
  },
}));
console.log(`OK ${CASA.nome} — cardápio: ${secoes.length} seções, ${total} itens -> cardapio.html`);
