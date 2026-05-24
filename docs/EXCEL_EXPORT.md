# Documentação — Exportação Excel (.xlsx)

## Visão Geral

O sistema UniAcadem utiliza a biblioteca **ExcelJS** para gerar arquivos `.xlsx` diretamente no navegador do usuário, sem necessidade de backend para gerar o arquivo. O fluxo é:

1. O frontend faz uma requisição GET à API do backend buscando **todos** os registros
2. Os dados retornados são mapeados para colunas definidas
3. A biblioteca ExcelJS monta o arquivo `.xlsx` em memória (buffer)
4. O arquivo é baixado pelo navegador via **file-saver**

---

## Bibliotecas Utilizadas

| Biblioteca   | Versão | Finalidade |
|-------------|--------|------------|
| `exceljs`   | ^4.x   | Geração de arquivos `.xlsx` com suporte a tabelas, estilos e formatação |
| `file-saver`| ^2.x   | Dispara o download do arquivo gerado no navegador |

### Instalação

```bash
npm install exceljs file-saver
```

### Import nos componentes

```js
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
```

---

## Rotas da API Consumidas

Todas as requisições utilizam `?size=9999` para buscar **todos os registros de uma vez**, ignorando a paginação padrão do backend (que retorna 10 por página).

### ms-tipo-usuario (Alunos, Professores, Coordenadores)

| Entidade      | Rota da API                        | Método | Query Params Suportados |
|--------------|-----------------------------------|--------|------------------------|
| Alunos       | `/api/v1/alunos`                  | GET    | `page`, `size`, `sort`, `matricula`, `email`, `nome`, `cpf` |
| Professores  | `/api/v1/professores`             | GET    | `page`, `size`, `sort`, `matricula`, `email`, `nome`, `cpf` |
| Coordenadores| `/api/v1/coordenadores`           | GET    | `page`, `size`, `sort`, `matricula`, `email`, `nome`, `cpf` |

**Consumo no frontend (via `api.js`):**
```js
// Alunos
api.getAlunosTipoAPI(0, 9999, appliedFilters)
// Professores
api.getProfessoresTipoAPI(0, 9999, appliedFilters)
// Coordenadores
api.getCoordenadoresTipoAPI(0, 9999, appliedFilters)
```

**Resposta esperada da API:**
```json
{
  "content": [
    {
      "usuarioId": "abc123",
      "matricula": "00100001",
      "nome": "João Silva",
      "email": "joao@email.com",
      "cpf": "12345678900",
      "celular": "11999999999",
      "dataNascimento": "2000-01-15T00:00:00",
      "anoIngresso": 2023
    }
  ],
  "totalElements": 25,
  "totalPages": 1,
  "pageNumber": 0,
  "pageSize": 9999
}
```

**Colunas exportadas:**

| Chave da API      | Coluna no Excel         |
|-------------------|------------------------|
| `matricula`       | MATRÍCULA              |
| `nome`            | NOME                   |
| `email`           | EMAIL                  |
| `cpf`             | CPF                    |
| `celular`         | CELULAR                |
| `dataNascimento`  | DATA DE NASCIMENTO     |
| `anoIngresso`     | ANO DE INGRESSO        |

> Nota: `dataNascimento` é formatado removendo a parte de horário (`split('T')[0]`)

---

### ms-usuario (Usuarios, Roles, Acessos)

| Entidade  | Rota da API                          | Método | Query Params |
|----------|--------------------------------------|--------|-------------|
| Usuarios | `/api/v1/usuarios?size=9999&sort=id` | GET    | `page`, `size`, `sort`, `nome`, `email`, `matricula` |
| Roles    | `/api/v1/roles?size=9999`            | GET    | `size` |
| Acessos  | `/api/v1/acessos?size=9999`          | GET    | `size` |

**Consumo no frontend (via fetch direto):**
```js
// Usuarios
fetch(API_ENDPOINTS.USUARIOS.PAGINATED(0, 9999, 'id', filters), buildAuthHeaders())

// Roles
fetch(`${API_ENDPOINTS.ROLES.BASE}?size=9999`, buildAuthHeaders())

// Acessos
fetch(`${API_ENDPOINTS.ACESSOS.BASE}?size=9999`, buildAuthHeaders())
```

**Colunas exportadas por entidade:**

#### Usuarios
| Chave da API | Coluna no Excel |
|-------------|----------------|
| `id`        | ID             |
| `matricula` | MATRÍCULA      |
| `nome`      | NOME           |
| `email`     | EMAIL          |
| `celular`   | CELULAR        |
| `roles[].role` | TIPO        |

> Nota: O campo TIPO é extraído do array `roles` do usuário: `roles.map(r => r.role).join(', ')`

#### Roles
| Chave da API | Coluna no Excel |
|-------------|----------------|
| `id`        | ID             |
| `role`      | ROLE           |
| `descricao` | DESCRIÇÃO      |

#### Acessos
| Chave da API | Coluna no Excel |
|-------------|----------------|
| `id`        | ID             |
| `acesso`    | ACESSO         |
| `descricao` | DESCRIÇÃO      |

---

## Parâmetros da Biblioteca ExcelJS

### 1. Criação do Workbook

```js
const workbook = new ExcelJS.Workbook();
workbook.creator = 'UniAcadem';   // Metadado: autor do arquivo
workbook.created = new Date();     // Metadado: data de criação
```

### 2. Criação da Worksheet (Aba)

```js
const worksheet = workbook.addWorksheet('NomeDaAba');
```

### 3. Definição de Largura das Colunas

```js
worksheet.columns = [
  { width: 18 },  // Coluna A
  { width: 30 },  // Coluna B
  { width: 30 },  // Coluna C
  // ...
];
```

### 4. Criação da Tabela (Ctrl+T no Excel)

Este é o recurso principal — gera uma tabela formatada com filtros automáticos, estilo zebrado e cabeçalho.

```js
worksheet.addTable({
  name: 'TabelaAlunos',          // Nome único da tabela (sem espaços)
  ref: 'A1',                      // Célula de referência (início da tabela)
  headerRow: true,                 // Incluir linha de cabeçalho
  totalsRow: false,                // Não incluir linha de totais
  style: {
    theme: 'TableStyleMedium2',    // Tema visual do Excel (existem ~60 temas)
    showRowStripes: true,          // Linhas zebradas (alternância de cor)
  },
  columns: [                       // Definição dos cabeçalhos
    { name: 'MATRÍCULA', filterButton: true },
    { name: 'NOME', filterButton: true },
    // ... filterButton: true habilita o dropdown de filtro em cada coluna
  ],
  rows: [                          // Array de arrays com os dados
    ['00100001', 'João Silva'],
    ['00100002', 'Maria Santos'],
  ],
});
```

**Parâmetros do `addTable`:**

| Parâmetro     | Tipo      | Descrição |
|--------------|-----------|-----------|
| `name`       | `string`  | Nome identificador da tabela. Deve ser único no workbook e sem espaços |
| `ref`        | `string`  | Referência da célula inicial (ex: `'A1'`) |
| `headerRow`  | `boolean` | Se `true`, a primeira linha é tratada como cabeçalho |
| `totalsRow`  | `boolean` | Se `true`, adiciona linha de totais ao final |
| `style.theme`| `string`  | Tema de estilo do Excel. Usamos `TableStyleMedium2` |
| `style.showRowStripes` | `boolean` | Habilita alternância de cor nas linhas |
| `columns`    | `array`   | Array de objetos com `name` (título) e `filterButton` (filtro) |
| `rows`       | `array`   | Array de arrays — cada sub-array é uma linha de dados |

**Temas de tabela disponíveis (exemplos):**
- `TableStyleLight1` a `TableStyleLight21`
- `TableStyleMedium1` a `TableStyleMedium28`
- `TableStyleDark1` a `TableStyleDark11`

### 5. Estilização do Cabeçalho

```js
const headerRow = worksheet.getRow(1);
headerRow.eachCell(cell => {
  cell.font = {
    bold: true,                          // Negrito
    color: { argb: 'FF000000' },         // Cor do texto (preto)
    size: 11,                            // Tamanho da fonte
  };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD97706' },       // Cor de fundo (#D97706 - âmbar)
  };
  cell.alignment = {
    horizontal: 'center',                // Alinhamento horizontal
    vertical: 'middle',                  // Alinhamento vertical
  };
});
headerRow.height = 28;                    // Altura da linha em pontos
```

**Formato de cor ARGB:** `'FF' + hex` onde `FF` = opacidade total
- `FFD97706` = #D97706 (âmbar)
- `FF000000` = #000000 (preto)
- `FFFFFFFF` = #FFFFFF (branco)

### 6. Estilização das Linhas de Dados

```js
for (let i = 2; i <= worksheet.rowCount; i++) {
  const row = worksheet.getRow(i);
  row.eachCell(cell => {
    cell.alignment = { vertical: 'middle' };
  });
  row.height = 22;
}
```

### 7. Geração e Download do Arquivo

```js
// Gera o buffer binário do arquivo .xlsx
const buffer = await workbook.xlsx.writeBuffer();

// Cria um Blob com o tipo MIME correto
const blob = new Blob([buffer], {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
});

// Dispara o download usando file-saver
saveAs(blob, 'uniacadem_alunos_2026-05-23.xlsx');
```

---

## Fluxo Completo (Diagrama)

```
┌──────────────┐     GET /api/v1/alunos?size=9999     ┌──────────────┐
│   Frontend   │ ──────────────────────────────────►   │   Backend    │
│  (React)     │                                       │  (Spring)    │
│              │   ◄──────────────────────────────────  │              │
│              │     { content: [...], totalElements }  │              │
└──────┬───────┘                                       └──────────────┘
       │
       │  Mapeia dados para colunas
       │
       ▼
┌──────────────┐
│   ExcelJS    │  Workbook → Worksheet → addTable()
│  (Browser)   │  Estiliza header + linhas
│              │  writeBuffer() → Blob
└──────┬───────┘
       │
       │  saveAs(blob, 'arquivo.xlsx')
       ▼
┌──────────────┐
│   Download   │  Arquivo .xlsx salvo no computador
│  (Browser)   │  do usuário
└──────────────┘
```

---

## Arquivos que Utilizam a Exportação

| Arquivo | Entidades Exportadas |
|---------|---------------------|
| `src/pages/admin/EntityList.jsx` | Alunos, Professores, Coordenadores |
| `src/pages/administrador/Usuarios.jsx` | Usuários |
| `src/pages/administrador/Roles.jsx` | Roles |
| `src/pages/administrador/Acessos.jsx` | Acessos |

---

## Observações

- Os filtros ativos são respeitados na exportação (ex: se filtrar por nome "João", só exporta os registros filtrados)
- O botão mostra um spinner de loading durante a requisição e geração do arquivo
- O botão fica desabilitado (`disabled`) durante a exportação para evitar cliques duplos
- Um toast de sucesso/erro é exibido ao finalizar
- O nome do arquivo segue o padrão: `uniacadem_{entidade}_{YYYY-MM-DD}.xlsx`
