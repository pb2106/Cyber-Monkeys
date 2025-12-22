# Prüfen - Privacy-Preserving Attribute Verification Platform

![Prüfen Logo](https://img.shields.io/badge/Prüfen-Privacy--First-purple?style=for-the-badge)

**Prove facts, not data.** Verify you're 18+ without revealing your date of birth.

## 🎯 What is Prüfen?

Prüfen is a **zero-knowledge attribute verification platform** that allows users to prove claims (e.g., "I'm over 18") without revealing the underlying personal data (e.g., date of birth).

### The Problem
- Traditional age verification requires surrendering personal information
- Verifiers often collect more data than needed
- Users have no control over their data after verification
- Risk of data breaches and identity theft

### The Prüfen Solution
- **Zero-Knowledge Proofs**: Prove you're 18+ without revealing your DOB
- **Verifier Binding**: Proofs work only for intended recipient
- **Time-Limited**: 5-minute expiration prevents reuse
- **Single-Use**: Cannot be replayed or reused
- **Auditable**: Cryptographically signed with RS256
- **Privacy-First**: Raw data never stored, only YES/NO results

## 🏗️ Architecture

```
User               Prüfen App           Backend API        Mock Verifier
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
  |<----------------------------------------------------- -------|
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn
- **Cloudflare Tunnel** (Required for mobile testing)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Generate RSA keys (happens automatically on first run)
python crypto_utils.py

# Seed database with test data
python seed_data.py

# Start server
python main.py
```

Backend will run at: **http://localhost:8000**
API docs: **http://localhost:8000/docs**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev -- --host
```

Frontend will run at: **http://localhost:5173**

### 3. Expose to Internet (Crucial for Mobile)

Since the mobile app needs to connect to your local backend, you must expose it via a tunnel. We recommend Cloudflare Tunnel.

```bash
# Install cloudflared (if not installed)
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation

# Start tunnel
cloudflared tunnel --url http://localhost:5173
```

Copy the `https://....trycloudflare.com` URL provided by the tunnel. Use this URL on your mobile device.

## 📱 Demo Flow

### 1. Mock Verifier (Alcohol Delivery App)

Visit: **http://localhost:5173/mock-verified/login** (or your Cloudflare URL)

### 2. Age Verification Flow

1. **Login** to mock verifier app
2. **Click "Verify with Prüfen"**
3. **QR code appears**

### 3. Prüfen Verification

**Mobile Testing (Recommended):**
1. Open the Cloudflare URL on your mobile browser.
2. Click **"Scan QR Code"**.
3. Scan the QR code shown on your desktop.
4. **Approve**: Click "Approve Verification".
   - Desktop should show "Verification Successful".
5. **Deny**: Click "Decline Request".
   - Desktop should show "Verification Denied".

**Desktop Testing:**
1. Right-click QR code → Save image.
2. Open **http://localhost:5173** in new tab.
3. Click "Upload QR Image".
4. Select saved QR code.
5. Approve or Decline.

## 🔐 Security Mechanisms

### 1. Verifier Binding
```python
verifier_hash = SHA256(api_key + salt)
# Proof bound to specific verifier - cannot be used elsewhere
```

### 2. Time-to-Live (TTL)
```python
expires_at = now() + 300 seconds  # 5 minutes
# Prevents long-term reuse
```

### 3. Single-Use Enforcement
```python
max_access = 1
# Proof can only be fetched once
```

### 4. Nonce (Replay Protection)
```python
nonce = secrets.token_hex(32)
# Stored in UsedNonce table
```

### 5. Cryptographic Signatures
```python
# RS256 (RSA-2048) JWT signing
jwt.encode(payload, private_key, algorithm="RS256")
```

## 📊 Database Schema

### Proofs
| Field | Type | Description |
|-------|------|-------------|
| proof_id | String | Unique proof identifier |
| user_id | String | User who generated proof |
| claim_type | String | e.g., "age_over_18" |
| **result** | **Boolean** | **YES/NO (NO RAW DATA!)** |
| verifier_hash | String | SHA-256 of verifier binding |
| jwt_token | Text | Signed cryptographic proof |
| expires_at | DateTime | 5-minute TTL |
| access_count | Integer | Single-use counter |

## 🔑 API Endpoints

### Proof Requests
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
{
  "user_id": "usr_12345"
}
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

## 🛠️ Technology Stack

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- PostgreSQL / SQLite (Database)
- python-jose (JWT signing with RS256)
- cryptography (RSA key generation)

**Frontend:**
- React 18
- Vite (Build tool)
- React Router (Routing)
- TailwindCSS (Styling)
- html5-qrcode (QR scanning)
- qrcode.react (QR generation)
- Axios (HTTP client)

## 📝 Environment Variables

Create `.env` file in backend directory:

```env
DATABASE_URL=sqlite:///./prufen.db
SECRET_KEY=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

## 📄 License

MIT License - feel free to use for educational or commercial purposes.

---

**Built with ❤️ for privacy**

🔒 **Prüfen** - Prove facts, not data.
