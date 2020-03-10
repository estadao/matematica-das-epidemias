# Matemática das epidemias

Este repositório contém o código-fonte que alimenta as visualizações de dados que estão [nesta reportagem](https://www.estadao.com.br/infograficos/saude,como-a-matematica-pode-ajudar-a-entender-e-combater-epidemias,1082298) sobre epidemiologia matemática.

## Dados

O programa em Python `virus_simulator.py` roda uma simulação simples da dinâmica de contágio de diversas doenças. Ele deve ser executdo no terminal (com o comando `python virus_simulator.py`). 

O resultado das simulações são salvos em formato **.json** no diretório `output`. Os arquivos representam uma cadeia de contágio, originada a partir de uma pessoa infectada. Abaixo está um exemplo:

```
[
    {
        "id": "0001",
        "virus_name": "Covid-19",
        "to_infect": 2,
        "countdown": 5,
        "alive": true,
        "resolved": true,
        "parent": null,
        "children": [
            "0002",
            "0003"
        ],
        "generation": 1
    },
    {
        "id": "0002",
        "virus_name": "Covid-19",
        "to_infect": 3,
        "countdown": 5,
        "alive": true,
        "resolved": true,
        "parent": "0001",
        "children": [
            "0004",
            "0005",
            "0006"
        ],
        "generation": 2
    },
    {
        "id": "0003",
        "virus_name": "Covid-19",
        "to_infect": 1,
        "countdown": 3,
        "alive": true,
        "resolved": true,
        "parent": "0001",
        "children": [
            "0007"
        ],
        "generation": 2
    },

  ...

  ...

  ...


]
```

É importante ressaltar que, como o programa faz uma simulação a partir de parâmetros estatísticos, o output é diferente a cada execução. 

## Visualização

O diretório `viz` contém três arquivos JavaScript. 

O primeiro que precisa ser executado é `pre-process-force.js`, que usa as simulações de força do pacote [d3.js](https://d3js.org/) para computar coordenadas as X e Y de cada ponto do gráfico a partir dos arquivos gerados por `virus_simulator.py`. O resultado é, então, salvo no próprio diretóerio na forma de um arquivo **.json** otimizado. Abaixo está um exemplo desses novos arquivos:

```
[


  {
    "cx": 135.9004516707361,
    "cy": 144.80477586608896,
    "id": "0001",
    "generation": 1,
    "virusName": "Covid-19",
    "alive": true
  },

  {
    "cx": 141.79796825639332,
    "cy": 140.25733249297497,
    "id": "0002",
    "generation": 2,
    "virusName": "Covid-19",
    "alive": true
  },

  {
    "cx": 126.60768195768344,
    "cy": 144.1299224886298,
    "id": "0003",
    "generation": 2,
    "virusName":" Covid-19",
    "alive": true
  },

  ...

  ...

  ...

]
```
Estes arquivos alimentas os scripts `draw.js` e `drawHypothetic.js`, que desenham as visualizações de dados na página `index.html`.

Para executar os sripts, o processo é simples: abra a página em um servidor local e, caso necessário, remova os comentários do final do arquivo.

