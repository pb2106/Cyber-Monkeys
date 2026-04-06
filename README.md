<div align="center">

# 🛡️ Veridia

### Privacy-Preserving Zero-Knowledge Verification

**Prove facts. Not data.**

[![License](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-18-06b6d4?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-10b981?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)

</div>

---

## What is Veridia?

Veridia is a **zero-knowledge attribute verification platform** that lets users prove claims (e.g., *"I'm over 18"*) without revealing the underlying personal data (e.g., date of birth).

### The Problem

| Issue | Impact |
|-------|--------|
| Traditional verification demands personal data | Privacy violation |
| Verifiers collect more than they need | Unnecessary exposure |
| Users lose control post-verification | Data misuse risk |
| Centralized data storage | Breach vulnerability |

### The Veridia Solution

- 🔐 **Zero-Knowledge Proofs** — Prove you're 18+ without revealing your DOB
- 🔗 **Verifier Binding** — Proofs work only for the intended recipient
- ⏱️ **Time-Limited** — 5-minute expiration prevents reuse
- 🔒 **Single-Use** — Cannot be replayed or reused
- ✅ **Auditable** — Cryptographically signed with RS256
- 🛡️ **Privacy-First** — Raw data never stored, only YES/NO results

---

## Architecture

```
User               Veridia App          Backend API        Mock Verifier
  |                     |                     |                  |
  |   1. Needs access   |                     |                  |
  |---------------------|-------------------->|                  |
  |                     |                     |  2. Request QR   |
  |                     |                     |<-----------------|
  | 3. Scans QR         |                     |                  |
  |-------------------->|                     |                  |
  |                     | 4. Fetch details    |                  |
  |                     |-------------------->|                  |
  |                     | 5. Show consent     |                  |
  | 6. Approves/Denies  |                     |                  |
  |-------------------->|                     |                  |
  |                     | 7. Generate proof   |                  |
  |                     |   (DOB → YES/NO)    |                  |
  |                     |-------------------->|                  |
  |                     |                     | 8. Send proof    |
  |                     |                     |----------------->|
  |                     |                     |                  |
  | 9. Access granted   |                     |                  |
  |<------------------------------------------------------- ----|
```

---

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- **Cloudflare Tunnel** (required for mobile testing)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Generate RSA keys (auto-generated on first run)
python crypto_utils.py

# Seed database with test data
python seed_data.py

# Start server
python main.py
```

> Backend: **http://localhost:8000** · API Docs: **http://localhost:8000/docs**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev -- --host
```

> Frontend: **http://localhost:5173**

### 3. Expose to Internet (for Mobile)

```bash
# Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:5173
```

Copy the `https://....trycloudflare.com` URL and use it on your mobile device.

---

## Demo Flow

### 1. Mock Verifier

Visit `http://localhost:5173/mock-verified/login` (or your Cloudflare URL)

### 2. Age Verification Flow

1. **Login** to mock verifier app
2. **Select a verification type** (Age, Student, Residency)
3. **QR code appears** on screen

### 3. Veridia Verification

**📱 Mobile Testing (Recommended):**
1. Open the Cloudflare URL on your mobile browser
2. Click **"Scan QR Code"**
3. Scan the QR code on your desktop
4. **Approve** → Desktop shows *"Verified"*
5. **Decline** → Desktop shows *"Request Denied"*

**🖥️ Desktop Testing:**
1. Right-click QR code → Save image
2. Open **http://localhost:5173** in a new tab
3. Click **"Upload QR Image"** → select the saved QR
4. Approve or Decline

---

## Database Schema

### Proofs Table

| Field | Type | Description |
|-------|------|-------------|
| `proof_id` | String | Unique proof identifier |
| `user_id` | String | User who generated proof |
| `claim_type` | String | e.g., `age_over_18` |
| **`result`** | **Boolean** | **YES/NO (no raw data!)** |
| `verifier_hash` | String | SHA-256 of verifier binding |
| `jwt_token` | Text | Signed cryptographic proof |
| `expires_at` | DateTime | 5-minute TTL |
| `access_count` | Integer | Single-use counter |

---

## API Endpoints

### Create Proof Request
```http
POST /api/proof-requests
Authorization: Bearer {verifier_api_key}

{
  "condition": "age_over_18",
  "expires_in": 300,
  "callback_url": "https://example.com/webhook"
}
```

### Approve Proof
```http
POST /api/proof-requests/{request_id}/approve

{ "user_id": "usr_12345" }
```

### Reject Proof
```http
POST /api/proof-requests/{request_id}/reject
```

### Fetch Proof
```http
GET /api/proofs/{proof_id}
Authorization: Bearer {verifier_api_key}
```

---

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | FastAPI · SQLAlchemy · SQLite/PostgreSQL · python-jose (RS256) · cryptography |
| **Frontend** | React 18 · Vite · React Router · TailwindCSS · html5-qrcode · qrcode.react · Axios |
| **Design** | Emerald/Cyan dark theme · Glassmorphism · Inter font · Micro-animations |

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=sqlite:///./veridia.db
SECRET_KEY=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

---

<div align="center">

### Done by

**[Prabhav M Naik](https://github.com/pb2106)** · **[Nathan Marc Anthony](https://github.com/Nathanmarc/)**

</div>
