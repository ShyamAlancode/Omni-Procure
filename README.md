# OmniProcure — Autonomous Enterprise Procurement Orchestrator

> **Amazon Nova AI Hackathon 2026 Submission — UI Automation Category**

OmniProcure is a production-grade, multi-agent AI system that autonomously executes
enterprise procurement workflows. It replaces brittle RPA scripts and manual
supplier portal navigation with self-healing visual AI — reducing a procurement
officer's 6-hour manual workload to under 30 minutes (11-times reduction in decision latency).

[![AWS](https://img.shields.io/badge/AWS-Bedrock-orange)](https://aws.amazon.com/bedrock/)
[![Nova Act](https://img.shields.io/badge/Amazon-Nova%20Act-blue)](https://aws.amazon.com/nova/)
[![Strands](https://img.shields.io/badge/AWS-Strands%20Agents-green)](https://github.com/strands-agents)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)

---

## The Problem

Enterprise procurement officers managing 50+ orders/week face:

- **6 hours/week** lost to manual cross-portal lookups and form entries
- **897 enterprise apps** with only 29% native interoperability
- **$500K–$2M/year** spent on S2P software with only 30% feature adoption
- **Brittle RPA scripts** that break on every UI update (CSS selector failures)

---

## The Solution

OmniProcure orchestrates a team of AI agents powered by Amazon Nova to:

1. **Understand** natural language procurement requests
2. **Search** internal ERP catalog via MCP (zero-trust, no raw DB access)
3. **Verify** compliance and budget rules automatically
4. **Navigate** legacy supplier portals visually using Nova Act
5. **Review** screenshot evidence with Nova Vision QA
6. **Request** human approval before executing the final order

---

## Architecture

User Prompt (Natural Language)
|
V
+---------------------------------+
| ORCHESTRATOR AGENT              |
| Amazon Nova Pro                 |
| AWS Strands Agents SDK          |
| maxReasoningEffort: high        |
+----+----------+-----------------+
     |          |
     V          V
+---------+ +--------------+
| CATALOG | | COMPLIANCE   |
| AGENT   | | AGENT        |
|Nova Lite| | Nova Lite    |
| MCP     | | MCP          |
+----+----+ +------+-------+
     |             |
     +------+------+
            |
            V
+-----------------------+
| ACTUATOR AGENT        |
| Amazon Nova Act       |
| Headless Browser Auto |
| demo_portal.html      |
+----------+------------+
           | screenshot
           V
+-----------------------+
| EVIDENCE REVIEWER     |
| Nova Lite Vision QA   |
| Nova MME Embeddings   |
| Magic-byte detection  |
+----------+------------+
           | verdict + confidence
           V
+-----------------------+
| HUMAN-IN-THE-LOOP     |
| HITL Approval Gate    |
| Approve / Reject      |
+----------+------------+
           |
           V
Purchase Order Executed
Saved to DB + CloudWatch

---

## AWS Services Used

| Service | Role in OmniProcure |
|---|---|
| **Amazon Nova Pro** | Master orchestrator with extended reasoning |
| **Amazon Nova Lite** | Catalog, compliance, evidence reviewer agents |
| **Amazon Nova Act** | Headless visual browser automation |
| **Nova Multimodal Embeddings** | Semantic product catalog matching |
| **AWS Strands Agents SDK** | Multi-agent orchestration framework |
| **Model Context Protocol (MCP)** | Zero-trust ERP database access |
| **Amazon Cognito** | User authentication (JWT) |
| **Amazon CloudWatch** | Structured audit trail and observability |
| **Amazon Bedrock** | Foundation model inference layer |

---

## Project Structure

omniprocure-landing/
├── backend/
│   ├── server.py             # FastAPI server, WebSocket streaming
│   ├── database.py           # SQLite ERP + audit log
│   ├── embedding_service.py  # Nova Multimodal Embeddings
│   ├── nova_act_worker.py    # Nova Act browser automation
│   ├── cloudwatch_logger.py  # AWS CloudWatch structured logging
│   ├── mcp_server.py         # MCP server (7 tools)
│   ├── demo_portal.html      # Supplier portal demo target
│   └── agents/
│       ├── orchestrator.py    # Nova Pro master agent
│       ├── catalog_agent.py   # Product search specialist
│       ├── compliance_agent.py# Budget & policy verification
│       ├── actuator_agent.py  # Nova Act interface agent
│       └── evidence_agent.py  # Vision QA reviewer
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout + Amplify provider
│   │   ├── dashboard/page.tsx # Main dashboard
│   │   └── auth/
│   │       ├── login/page.tsx # Cognito login
│   │       └── register/page.tsx # Cognito registration
│   ├── components/
│   │   ├── AIOrchestratorPanel.tsx # Main agent UI + WebSocket
│   │   ├── EvidenceReviewPanel.tsx # Vision QA results panel
│   │   └── AmplifyProvider.tsx # Amplify config provider
│   └── lib/
│       ├── auth.ts           # Cognito auth helpers
│       └── cognitoConfig.ts  # Amplify configuration
├── .env.local                # Environment variables
├── requirements.txt          # Python dependencies
├── package.json              # Node dependencies
└── README.md

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- AWS Account with Bedrock access
- Amazon Cognito User Pool

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/omniprocure-landing.git
cd omniprocure-landing
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m playwright install chromium
```

### 3. Environment Variables

Create `.env.local` in the project root:

```text
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

Create `backend/.env`:

```text
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
NOVA_ACT_API_KEY=your_nova_act_key
```

### 4. Run Backend

```bash
cd backend
python server.py
```

Server starts at `http://localhost:8000`

### 5. Run Frontend

```bash
# From project root
npm install
npm run dev
```

Frontend starts at `http://localhost:3000`

---

## Pipeline Flow

```text
POST /agent/procure
        |
        +-- ORCHESTRATOR     -> Nova Pro reasons about the request
        +-- CATALOG_MATCH    -> Nova MME finds best SKU match
        +-- COMPLIANCE_CHECK -> Budget & supplier policy verified
        +-- BROWSER_AUTO     -> Nova Act navigates supplier portal
        +-- EVIDENCE_REVIEW  -> Nova Vision QA verifies screenshot
        +-- HITL_PENDING     -> Human approves/rejects via UI
                |
                +-- POST /agent/approve/{job_id}
                +-- POST /agent/reject/{job_id}
```

All steps stream in real-time to the frontend via WebSocket at
`ws://localhost:8000/ws/agent-stream/{job_id}`

---

## Business Impact

| Metric | Before OmniProcure | After OmniProcure |
|---|---|---|
| Manual lookup time | 6 hours/week | 30 minutes/week |
| Decision latency | Hours | < 2 minutes |
| RPA maintenance cost | High (brittle scripts) | Zero (visual AI) |
| API integration cost | $500K–$2M | $0 (Nova Act) |
| Audit trail | Manual logs | Automated CloudWatch |

*11-times reduction in procurement decision latency.*

---

## Security and Governance

* **Zero-trust data access**: LLM never touches raw database, accessing information via strictly defined Model Context Protocol (MCP) interfaces.
* **Human-in-the-Loop (HITL)**: Mandatory approval gate ensures no purchase order is executed without explicit human authorization.
* **Cognito Authentication**: All API endpoints protected by Amazon Cognito JWT authentication.
* **CloudWatch Audit Trail**: Every agent decision and state transition is logged with a unique job ID for full observability.
* **Automated Compliance**: Compliance agent enforces organizational policy, automatically blocking non-compliant procurement requests.

---

## Technical Differentiators

### Self-Healing Browser Automation
Nova Act operates at intent level rather than DOM level. It visually understands high-level actions (e.g., "click checkout") without relying on brittle CSS selectors, making it immune to UI updates that typically break traditional RPA scripts.

### Cross-Modal Evidence Verification
Before final execution, two independent verification layers run in parallel:
1.  **Nova Vision**: Performs OCR and semantic reading of the portal state.
2.  **Nova Multimodal Embeddings**: Computes vector similarity between the requested product and the actual portal screenshot.

### Extended Reasoning Orchestration
The master orchestrator leverages Amazon Nova Pro with extended reasoning capabilities. The system generates internal thinking tokens to analyze complex multi-supplier scenarios before delegating to specialist agents, ensuring enterprise-grade decision integrity.

---

## License
Apache 2.0

---

## Hackathon Submission
**Event**: Amazon Nova AI Hackathon 2026  
**Category**: UI Automation (Primary)  
**Team**: OmniProcure  
**Region**: India
