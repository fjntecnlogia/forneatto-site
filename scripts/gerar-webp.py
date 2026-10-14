#!/usr/bin/env python3
"""
gerar-webp.py — gera as versoes WebP (varios tamanhos) das fotos da home.

    pip install pillow
    python3 scripts/gerar-webp.py

Para cada foto de assets/img/italiano listada em FOTOS, grava ao lado do JPEG
um arquivo por largura: `salao.jpg` -> `salao-480.webp`, `salao-800.webp`...
O JPEG original NAO muda e continua sendo o fallback do <picture>.

Por que existe: a home carregava ~5 MB em JPEG 1600x900 para quadros que o
celular mostra com ~350 px. O <picture> da home escolhe a largura certa
(srcset/sizes) e o navegador so baixa o que cabe na tela.

Foto nova entrou? Acrescente a linha em FOTOS, rode este script e use o mesmo
padrao de <picture> das outras fotos do index.html.

Idempotente: reescreve sempre. Nunca amplia (largura maior que a do original
e ignorada). Sem EXIF: o Pillow so grava o que a gente passa.
"""
from pathlib import Path
from PIL import Image

PASTA = Path(__file__).resolve().parent.parent / 'assets' / 'img' / 'italiano'

# nome -> (larguras, qualidade)
FOTOS = {
    # topo do site: tem veu escuro por cima, entao aguenta qualidade menor.
    # Cobre a tela pela ALTURA no celular (a secao e mais alta que larga), por
    # isso a menor versao tem 1280 e nao 640.
    'hero':                  ((1280, 1920), 58),
    # molduras largas (16:9)
    'salao':                 ((480, 800, 1280), 78),
    'salao-bar':             ((480, 800, 1280), 78),
    'salao-limoeiros':       ((480, 800, 1280), 78),
    'salao-mesas':           ((480, 800, 1280), 78),
    'decoracao-prateleira':  ((480, 800, 1280), 78),
    # molduras em pe (3:4 e 9:16)
    # 9:16 de celular, mostradas em 3:4: ja saem cortadas em 3:4 (o mesmo corte
    # centralizado que o object-fit faria), sem carregar 25% de pixel que
    # ninguem ve.
    'tavolata':              ((480, 800), 78),
    'salao-limoeiro-mesas':  ((480, 800), 78),
    'mesa-posta':            ((480, 800), 78),
    'decoracao-canecas':     ((480, 800), 78),
    'decoracao-espresso':    ((480, 800), 78),
    'decoracao-negroni':     ((480, 800), 78),
    'decoracao-pina':        ((480, 800), 78),
    'porta':                 ((480, 800), 78),
    'mapa':                  ((480, 800), 80),
}

# Fotos em pe cortadas em 3:4 antes de redimensionar (ver acima).
CORTE_3x4 = {'tavolata', 'salao-limoeiro-mesas', 'mesa-posta'}


def corte_centro(im, proporcao):
    """Corta pelo centro na proporcao largura/altura, como o object-fit: cover."""
    if im.width / im.height <= proporcao:
        h = round(im.width / proporcao)
        topo = (im.height - h) // 2
        return im.crop((0, topo, im.width, topo + h))
    return im


def hero_celular():
    """O topo no celular, cortado para o que a tela mostra.

    No celular a secao do topo e ~3x mais alta que larga (390x1180), e o
    `cover` encaixa a foto pela ALTURA: so ~19% da largura aparece. Entregar a
    foto inteira (1280 px) para mostrar uma faixa de 357 px era 100 KB a mais
    na imagem do LCP. O corte abaixo e a janela que o `background-position:
    68% center` ja mostrava, com folga para telas de 320 a 600 px. Se mudar
    aquele valor no index.html, mude XD aqui.
    """
    XD, LARG = 871, 640   # janela de 640 px da foto de 1920, centrada onde os 68% caem
    im = Image.open(PASTA / 'hero.jpg').convert('RGB')
    janela = im.crop((XD, 0, XD + LARG, im.height))          # 640x1080
    destino = PASTA / 'hero-mobile.webp'
    janela.resize((540, 911), Image.LANCZOS).save(destino, 'WEBP', quality=48, method=6)
    print(f'  {destino.name:38s} 540x911  {destino.stat().st_size/1024:6.1f} KB')
    return destino.stat().st_size


if __name__ == '__main__':
    total = hero_celular()
    for nome, (larguras, qualidade) in FOTOS.items():
        origem = PASTA / f'{nome}.jpg'
        im = Image.open(origem).convert('RGB')
        if nome in CORTE_3x4:
            im = corte_centro(im, 3 / 4)
        for w in larguras:
            if w > im.width:
                continue
            h = round(im.height * w / im.width)
            destino = PASTA / f'{nome}-{w}.webp'
            im.resize((w, h), Image.LANCZOS).save(destino, 'WEBP', quality=qualidade, method=6)
            kb = destino.stat().st_size / 1024
            total += destino.stat().st_size
            print(f'  {destino.name:38s} {w}x{h}  {kb:6.1f} KB')
    print(f'total: {total/1024:.0f} KB')
