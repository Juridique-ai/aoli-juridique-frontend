# Juridique AI - API Documentation

## Base URL

```
Production: https://aoli-juridique-dev-func.azurewebsites.net
```

---

## Authentication

All endpoints require a function key. Pass it in one of two ways:

**Option 1: Header (Recommended)**
```
x-functions-key: YOUR_FUNCTION_KEY
```

**Option 2: Query Parameter**
```
?code=YOUR_FUNCTION_KEY
```

---

## Response Format

### Standard Response
```json
{
  "result": "..."
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

---

## Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/p1/analyze` | POST | Contract Analysis |
| `/api/p1/analyze/stream` | POST | Contract Analysis (SSE) |
| `/api/p2/analyze` | POST | Formation Assistant |
| `/api/p2/analyze/stream` | POST | Formation Assistant (SSE) |
| `/api/p3/advise` | POST | Legal Advisor |
| `/api/p3/advise/stream` | POST | Legal Advisor (SSE) |
| `/api/p4/draft` | POST | Legal Correspondence |
| `/api/p4/draft/stream` | POST | Legal Correspondence (SSE) |
| `/api/p5/draft` | POST | Procedural Documents |
| `/api/p5/draft/stream` | POST | Procedural Documents (SSE) |

---

## Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "3.0.0",
  "framework": "agent-framework",
  "environment": "dev"
}
```

---

## P1: Contract Analysis

Analyzes contracts and identifies risks, obligations, and recommendations.

### Standard Endpoint

```
POST /api/p1/analyze
Content-Type: application/json
```

**Request Body:**
```json
{
  "documentContent": "string (required) - The full contract text",
  "userParty": "string (optional) - client | prestataire | acheteur | vendeur | employee | employer",
  "jurisdiction": "string (optional) - FR | BE | LU | DE (default: FR)",
  "language": "string (optional) - fr | en (default: fr)"
}
```

**Example:**
```json
{
  "documentContent": "CONTRAT DE PRESTATION DE SERVICES\n\nEntre les soussignés:\nLa société ABC SARL...",
  "userParty": "prestataire",
  "jurisdiction": "FR",
  "language": "fr"
}
```

**Response:**
```json
{
  "result": "## Analyse du Contrat\n\n### Résumé\n..."
}
```

### Streaming Endpoint

```
POST /api/p1/analyze/stream
Content-Type: application/json
```

Same request body as standard endpoint. Returns SSE stream.

---

## P2: Formation Assistant

Guides users through company formation process.

### Standard Endpoint

```
POST /api/p2/analyze
Content-Type: application/json
```

**Request Body:**
```json
{
  "country": "string (required) - FR | BE | LU | DE",
  "questionnaire": {
    "activityType": "string - tech_startup | commerce | services | artisan | liberal",
    "activityDescription": "string - Description of the business",
    "foundersCount": "number - Number of founders",
    "plannedCapital": "number - Initial capital in euros",
    "fundraisingPlanned": "boolean - Planning to raise funds?",
    "employeesPlanned": "number - Expected employees in year 1",
    "revenueEstimate": "number - Expected revenue year 1",
    "personalAssetProtection": "boolean - Need asset protection?",
    "exitPlanned": "boolean - Planning future exit/sale?"
  },
  "language": "string (optional) - fr | en (default: fr)"
}
```

**Example:**
```json
{
  "country": "FR",
  "questionnaire": {
    "activityType": "tech_startup",
    "activityDescription": "Application mobile de livraison",
    "foundersCount": 2,
    "plannedCapital": 10000,
    "fundraisingPlanned": true,
    "employeesPlanned": 5,
    "revenueEstimate": 100000,
    "personalAssetProtection": true,
    "exitPlanned": true
  },
  "language": "fr"
}
```

### Streaming Endpoint

```
POST /api/p2/analyze/stream
```

Same request body. Returns SSE stream.

---

## P3: Legal Advisor

Provides legal advice and answers legal questions.

### Standard Endpoint

```
POST /api/p3/advise
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "string (required) - The legal question",
  "jurisdiction": "string (optional) - FR | BE | LU | DE (default: FR)",
  "language": "string (optional) - fr | en | de (default: fr)"
}
```

**Example:**
```json
{
  "message": "Mon employeur veut me licencier après 5 ans de CDI. Quels sont mes droits?",
  "jurisdiction": "FR",
  "language": "fr"
}
```

**Response Structure:**

The agent may respond in phases:

**Phase 1 - Clarification (if needed):**
```json
{
  "result": {
    "phase": "clarification",
    "clarifyingQuestions": [
      "Question 1?",
      "Question 2?"
    ]
  }
}
```

**Phase 2 - Final Answer:**
```json
{
  "result": "## Analyse Juridique\n\n### Vos Droits\n..."
}
```

### Streaming Endpoint

```
POST /api/p3/advise/stream
```

Same request body. Returns SSE stream.

---

## P4: Legal Correspondence

Drafts formal legal letters (mise en demeure, résiliation, etc.).

### Standard Endpoint

```
POST /api/p4/draft
Content-Type: application/json
```

**Request Body:**
```json
{
  "request": "string (required) - What letter is needed",
  "letterType": "string (optional) - mise_en_demeure | resiliation | reclamation | notification",
  "toneLevel": "number (optional) - 1 to 4 (1=cordial, 4=pre-contentious)",
  "sender": {
    "name": "string",
    "address": "string",
    "type": "individual | company"
  },
  "recipient": {
    "name": "string",
    "address": "string",
    "type": "individual | company"
  },
  "context": {
    "relationship": "string - client | fournisseur | employeur | bailleur | locataire",
    "priorCommunications": "string - Summary of prior exchanges",
    "supportingDocuments": ["string - List of available documents"]
  },
  "jurisdiction": "string (optional) - FR | BE | LU | DE (default: FR)",
  "language": "string (optional) - fr | de (default: fr)"
}
```

**Example:**
```json
{
  "request": "Mon fournisseur ne m'a pas livré depuis 2 mois malgré le paiement. Je veux une mise en demeure.",
  "letterType": "mise_en_demeure",
  "toneLevel": 3,
  "sender": {
    "name": "Jean Dupont",
    "address": "15 rue de la Paix, 75001 Paris",
    "type": "individual"
  },
  "recipient": {
    "name": "Société XYZ SARL",
    "address": "10 avenue des Champs, 75008 Paris",
    "type": "company"
  },
  "context": {
    "relationship": "client",
    "priorCommunications": "3 emails sans réponse",
    "supportingDocuments": ["Facture du 15/10/2024", "Bon de commande"]
  },
  "jurisdiction": "FR",
  "language": "fr"
}
```

### Streaming Endpoint

```
POST /api/p4/draft/stream
```

Same request body. Returns SSE stream.

---

## P5: Procedural Documents

Drafts court documents (assignation, conclusions, requête, etc.).

### Standard Endpoint

```
POST /api/p5/draft
Content-Type: application/json
```

**Request Body:**
```json
{
  "request": "string (required) - What document is needed",
  "documentType": "string (optional) - assignation | conclusions | requete | memoire | appel | replique",
  "courtType": "string (optional) - civil | commercial | administrative | labor",
  "procedureType": "string (optional) - premiere_instance | appel | cassation",
  "procedureNature": "string (optional) - fond | refere",
  "caseInfo": {
    "caseNumber": "string - RG number if exists",
    "court": {
      "name": "string - Court name",
      "address": "string - Court address"
    },
    "parties": {
      "plaintiff": {
        "name": "string",
        "address": "string",
        "siren": "string (optional for companies)"
      },
      "defendant": {
        "name": "string",
        "address": "string",
        "siren": "string (optional)"
      }
    },
    "keyDates": {
      "hearingDate": "string - YYYY-MM-DD",
      "filingDeadline": "string - YYYY-MM-DD"
    }
  },
  "facts": [
    {
      "date": "string - YYYY-MM-DD",
      "description": "string - What happened"
    }
  ],
  "claims": {
    "principal": "number - Main amount claimed",
    "interest": "boolean - Request legal interest?",
    "damages": "number - Additional damages",
    "article700": "number - Legal fees (Article 700 CPC)",
    "otherRequests": ["string - Other requests"]
  },
  "jurisdiction": "string (optional) - FR | BE | LU | DE (default: FR)",
  "language": "string (optional) - fr | de (default: fr)"
}
```

**Example:**
```json
{
  "request": "Je dois assigner mon ancien employeur pour licenciement abusif",
  "documentType": "assignation",
  "courtType": "labor",
  "procedureType": "premiere_instance",
  "procedureNature": "fond",
  "caseInfo": {
    "court": {
      "name": "Conseil de Prud'hommes de Paris",
      "address": "27 rue Louis Blanc, 75010 Paris"
    },
    "parties": {
      "plaintiff": {
        "name": "Marie Martin",
        "address": "20 rue du Commerce, 75015 Paris"
      },
      "defendant": {
        "name": "Société Tech Solutions SAS",
        "address": "100 avenue de la République, 75011 Paris",
        "siren": "123456789"
      }
    }
  },
  "facts": [
    {"date": "2020-03-01", "description": "Embauche en CDI comme développeuse senior"},
    {"date": "2024-10-15", "description": "Convocation entretien préalable"},
    {"date": "2024-11-01", "description": "Notification du licenciement pour faute grave"}
  ],
  "claims": {
    "principal": 45000,
    "interest": true,
    "damages": 10000,
    "article700": 3000,
    "otherRequests": ["Remise des documents de fin de contrat"]
  },
  "jurisdiction": "FR",
  "language": "fr"
}
```

### Streaming Endpoint

```
POST /api/p5/draft/stream
```

Same request body. Returns SSE stream.

---

## Streaming (SSE) Implementation

All `/stream` endpoints return Server-Sent Events (SSE).

### SSE Event Types

| Event | Description | Data |
|-------|-------------|------|
| `started` | Agent started processing | `{"agent": "agent_name"}` |
| `tool_call` | Tool being called | `{"tool": "tool_name", "arguments": {...}}` |
| `tool_result` | Tool completed | `{"tool": "tool_name", "result": "..."}` |
| `content` | Content chunk | `{"content": "text chunk"}` |
| `completed` | Processing finished | `{"result": "full response"}` |
| `error` | Error occurred | `{"error": "error message"}` |

### SSE Format

Each event follows SSE format:
```
event: event_type
data: {"json": "payload"}

```

### JavaScript Implementation

```javascript
async function streamLegalAdvice(message, jurisdiction = 'FR') {
  const response = await fetch('https://aoli-juridique-dev-func.azurewebsites.net/api/p3/advise/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-functions-key': 'YOUR_FUNCTION_KEY'
    },
    body: JSON.stringify({ message, jurisdiction })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        const eventType = line.slice(7);
        // Next line should be data
      }
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        handleEvent(eventType, data);
      }
    }
  }
}

function handleEvent(eventType, data) {
  switch (eventType) {
    case 'started':
      console.log('Agent started:', data.agent);
      showLoadingState();
      break;

    case 'tool_call':
      console.log('Calling tool:', data.tool);
      showToolProgress(data.tool); // e.g., "Searching legal database..."
      break;

    case 'tool_result':
      console.log('Tool completed:', data.tool);
      hideToolProgress();
      break;

    case 'content':
      appendContent(data.content); // Stream content to UI
      break;

    case 'completed':
      setFinalResult(data.result);
      hideLoadingState();
      break;

    case 'error':
      showError(data.error);
      break;
  }
}
```

### React Hook Example

```javascript
import { useState, useCallback } from 'react';

const API_BASE = 'https://aoli-juridique-dev-func.azurewebsites.net';
const API_KEY = 'YOUR_FUNCTION_KEY';

export function useLegalStream() {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [currentTool, setCurrentTool] = useState(null);
  const [error, setError] = useState(null);

  const streamRequest = useCallback(async (endpoint, body) => {
    setIsLoading(true);
    setContent('');
    setError(null);
    setCurrentTool(null);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-functions-key': API_KEY
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7);
          } else if (line.startsWith('data: ') && currentEvent) {
            const data = JSON.parse(line.slice(6));

            switch (currentEvent) {
              case 'tool_call':
                setCurrentTool(data.tool);
                break;
              case 'tool_result':
                setCurrentTool(null);
                break;
              case 'content':
                setContent(prev => prev + data.content);
                break;
              case 'completed':
                setContent(data.result);
                break;
              case 'error':
                setError(data.error);
                break;
            }
            currentEvent = '';
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, content, currentTool, error, streamRequest };
}

// Usage
function LegalAdvisor() {
  const { isLoading, content, currentTool, error, streamRequest } = useLegalStream();

  const handleSubmit = (question) => {
    streamRequest('/api/p3/advise/stream', {
      message: question,
      jurisdiction: 'FR'
    });
  };

  return (
    <div>
      {isLoading && <Spinner />}
      {currentTool && <ToolIndicator tool={currentTool} />}
      {content && <MarkdownRenderer content={content} />}
      {error && <ErrorMessage error={error} />}
    </div>
  );
}
```

### Tool Progress Messages

Map tool names to user-friendly messages:

```javascript
const toolMessages = {
  'perplexity_search_legal': 'Recherche dans les bases juridiques...',
  'perplexity_search_formation': 'Recherche des informations de création...',
  'verify_legal_claim': 'Vérification des références juridiques...'
};

function showToolProgress(toolName) {
  const message = toolMessages[toolName] || 'Traitement en cours...';
  // Display message to user
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (missing/invalid parameters) |
| 401 | Unauthorized (missing/invalid API key) |
| 500 | Server Error |

### Error Response Format

```json
{
  "error": "Description of the error"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `"documentContent is required"` | P1: Missing contract text | Provide `documentContent` field |
| `"message is required"` | P3: Missing question | Provide `message` field |
| `"request is required"` | P4/P5: Missing request | Provide `request` field |
| `"country is required"` | P2: Missing country | Provide `country` field |
| `"questionnaire is required"` | P2: Missing questionnaire | Provide `questionnaire` object |

---

## Rate Limits & Best Practices

1. **Timeouts**: Agent responses can take 15-60 seconds. Set appropriate timeouts.

2. **Streaming**: Use streaming endpoints for better UX - show progress to users.

3. **Error Retry**: Implement exponential backoff for 500 errors.

4. **Content Length**: Contract analysis (P1) and procedural documents (P5) may return large responses.

5. **Language**: Always specify `language` for consistent response language.

---

## cURL Examples

### P1 - Contract Analysis
```bash
curl -X POST "https://aoli-juridique-dev-func.azurewebsites.net/api/p1/analyze" \
  -H "x-functions-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "documentContent": "CONTRAT DE TRAVAIL...",
    "userParty": "employee",
    "jurisdiction": "FR"
  }'
```

### P2 - Formation Assistant
```bash
curl -X POST "https://aoli-juridique-dev-func.azurewebsites.net/api/p2/analyze" \
  -H "x-functions-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "FR",
    "questionnaire": {
      "activityType": "tech_startup",
      "foundersCount": 2,
      "plannedCapital": 10000
    }
  }'
```

### P3 - Legal Advisor
```bash
curl -X POST "https://aoli-juridique-dev-func.azurewebsites.net/api/p3/advise" \
  -H "x-functions-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quels sont mes droits en cas de licenciement?",
    "jurisdiction": "FR"
  }'
```

### P4 - Legal Correspondence
```bash
curl -X POST "https://aoli-juridique-dev-func.azurewebsites.net/api/p4/draft" \
  -H "x-functions-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "request": "Mise en demeure pour facture impayée de 5000 euros",
    "letterType": "mise_en_demeure",
    "toneLevel": 3,
    "jurisdiction": "FR"
  }'
```

### P5 - Procedural Documents
```bash
curl -X POST "https://aoli-juridique-dev-func.azurewebsites.net/api/p5/draft" \
  -H "x-functions-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "request": "Conclusions en réponse pour litige commercial",
    "documentType": "conclusions",
    "courtType": "commercial",
    "jurisdiction": "FR"
  }'
```

---

## Support

For API issues, contact the backend team.
