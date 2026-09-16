# Forneatto — fotos para tirar

> Lista do que falta fotografar para a home virar vitrine em vez de cardápio.
> Escrita em 16/09/2026, conferindo arquivo por arquivo o que o site pede e o
> que existe na pasta.

## ⚠️ Esta casa não tem NENHUMA fotografia

Não é exagero. A pasta `assets/img/italiano/` tem só dois desenhos de
simulação, e o site aponta hoje para dois arquivos que **não existem**:

```
forneattocucina.com.br/assets/img/italiano/hero.jpg   404
forneattocucina.com.br/assets/img/italiano/og.jpg     404
```

O `og.jpg` é o mais caro dos dois: é a imagem que aparece quando alguém manda
`forneattocucina.com.br` no WhatsApp. **Hoje não aparece imagem nenhuma** — o
link chega como uma linha de texto cinza, do lado de uma conversa cheia de
fotos. Enquanto isso não for resolvido, cada link compartilhado do Forneatto
vale menos que o do Saikō e o do Kikiu.

## A ordem em que valem a pena

### 1. O forno a lenha com o fogo aceso — **tira esta primeiro**

É a única coisa que o Forneatto tem e as outras duas casas não. Fogo,
madeira, a boca do forno. Tire **duas versões da mesma cena**:

- uma deitada → vira o `hero` (topo do site)
- a mesma cena → vira o `og` (a prévia do WhatsApp)

Melhor horário: o forno aquecendo antes do serviço, com a casa ainda no
escuro. O fogo precisa ser a coisa mais clara da foto.

### 2. Uma pizza saindo do forno, na pá

Na pá de madeira, ainda na boca do forno, com a borda marcada. Formato
`prato`.

### 3. A massa sendo aberta de manhã

A home promete: *"A massa é aberta de manhã. Toda manhã."* e *"o que sai da
cozinha às sete da noite foi aberto à mão às sete da manhã"*. **Essa frase só
convence com a foto ao lado.** Mãos na massa, farinha na bancada, luz da
manhã. Formato `galeria`.

### 4. Mais três pratos para a vitrine

Uma massa, um ragù e a sobremesa da casa. Formato `prato`.

### 5. A fachada

Formato `porta`. À noite, com a luz de dentro acesa.

### 6. O salão com gente

Formato `galeria`.

## Como entregar cada foto

Tire tudo no **maior tamanho que o celular deixar** e me mande o original. O
corte, o tamanho e a limpeza dos dados são feitos por um comando — não corte
nada à mão, e não mande print de tela.

**No seu PC (PowerShell)**, com a foto já baixada:

```
python3 scripts/otimizar-fotos.py C:\caminho\da\foto.jpg assets/img/italiano/hero.jpg hero
```

Trocando o último pedaço pelo formato de cada uma:

| formato | tamanho | onde aparece |
|---|---|---|
| `hero` | 1920×1080 | a foto grande do topo do site |
| `og` | 1200×630 | **a prévia quando alguém manda o link no WhatsApp** |
| `prato` | 1000×1250 | a vitrine da home e as fichas do cardápio |
| `galeria` | 1200×1200 | bloco de ambiente |
| `porta` | 900×1400 | a fachada, em retrato |

O comando gira a foto pelo EXIF antes de cortar (foto de celular vem deitada
com uma etiqueta dizendo que está em pé) e **apaga o EXIF depois** — essa
etiqueta carrega o GPS de onde a foto foi tirada e o modelo do aparelho, e
isso não tem por que subir para a internet.

## Três regras que valem mais que equipamento

1. **Luz de janela, nunca o flash.** Flash de celular achata a comida e deixa
   a cor doente. Mesa perto da janela, no fim da tarde, é melhor do que
   qualquer equipamento.
2. **Fotografe o prato como ele sai**, não uma montagem especial. Cliente que
   vê uma coisa no site e recebe outra na mesa não volta.
3. **Casa cheia vale mais que casa vazia.** Salão vazio parece que ninguém
   quer ir. Peça para a equipe sentar nas mesas se precisar.
