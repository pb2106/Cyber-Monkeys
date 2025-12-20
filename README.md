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
  |------------------->|                     |                  |
  |                     | 4. Fetch details    |                  |
  |                     |-------------------->|                  |
  |                     | 5. Show consent     |                  |
  | 6. Approves        |                     |                  |
  |------------------->|                     |                  |
  |                     | 7. Generate proof   |                  |
  |                     |   (DOB → YES/NO)    |                  |
  |                     |-------------------->|                  |
  |                     |                     | 8. Send proof    |
  |                     |                     |----------------->|
  |                     |                     |                  |
  | 9. Access granted  |                     |                  |
  |<----------------------------------------------------- --------|
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

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

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

## 📱 Demo Flow

### 1. Mock Verifier (Alcohol Delivery App)

Visit: **http://localhost:5173/mock-verifier/login**

**Test Accounts:**
- `john@example.com` / `password123` (34 years old - ✓ PASSES)
- `bob@example.com` / `password123` (20 years old - ✓ PASSES)
- `jane@example.com` / `password123` (14 years old - ✗ FAILS)

### 2. Age Verification Flow

1. **Login** to mock verifier app
2. **Click "Verify with Prüfen"**
3. **QR code appears**

### 3. Prüfen Verification

**Desktop Testing:**
1. Right-click QR code → Save image
2. Open **http://localhost:5173** in new tab (Prüfen app)
3. Click "Upload QR Image"
4. Select saved QR code
5. Review consent screen
6. Click "Approve Verification"
7. Return to verifier tab

**Mobile Testing:**
1. Open Prüfen app on mobile
2. Click "Scan QR Code"
3. Scan QR from desktop screen
4. Approve verification

### 4. Verification Complete

Verifier receives **YES/NO only** - no personal data!

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

### 6. Audit Trail
```python
# Immutable audit log for all operations
AuditLog(proof_id, action, timestamp, metadata)
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

### Audit Log
| Field | Type | Description |
|-------|------|-------------|
| log_id | Integer | Auto-increment |
| proof_id | String | Proof reference |
| action | String | created, accessed, expired |
| timestamp | DateTime | When action occurred |
| metadata | Text | Additional context (JSON) |

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

### Fetch Proof
```http
GET /api/proofs/{proof_id}
Authorization: Bearer {verifier_api_key}
```

### Response (What Verifier Receives)
```json
{
  "proof_id": "pf_abc123",
  "claim_type": "age_over_18",
  "result": true,  // YES or NO only!
  "signature": "eyJhbGc...",
  "privacy_guarantee": "This proof contains NO personal data."
}
```

## 🎨 Frontend Features

### Prüfen App
- **Home Page**: Scan or upload QR codes
- **QR Scanner**: Live camera scanning with html5-qrcode
- **Consent Screen**: Privacy-focused disclosure
- **Success Page**: Confirmation with privacy guarantees

### Mock Verifier App
- **Login**: Demo accounts with different ages
- **Age Gate**: QR code generation
- **Verified Page**: Shows received proof (YES/NO only)

## 🧪 Testing

### Test Cases

**1. Valid Adult User**
```bash
# Login as john@example.com (34 years old)
# Generate QR → Scan → Approve → Should receive YES
```

**2. Valid Young Adult**
```bash
# Login as bob@example.com (20 years old)
# Generate QR → Scan → Approve → Should receive YES
```

**3. Underage User**
```bash
# Login as jane@example.com (14 years old)
# Generate QR → Scan → Approve → Should receive NO
```

**4. Expired Proof**
```bash
# Generate proof → Wait 6 minutes → Try to access → Should fail with 410 Gone
```

**5. Replay Attack**
```bash
# Fetch proof → Try to fetch again → Should fail with "already consumed"
```

**6. Wrong Verifier**
```bash
# Generate proof for Verifier A → Try to access with Verifier B API key
# Should fail with 403 Forbidden
```

## 📚 Privacy Guarantees

### What Verifiers GET:
✅ **YES or NO result only**
✅ Cryptographic signature (RS256)
✅ Claim type (e.g., "age_over_18")
✅ Expiration time
✅ Proof ID

### What Verifiers DON'T GET:
❌ Date of birth
❌ Name
❌ ID number
❌ Address
❌ Any other personal data

### Data Lifecycle
1. **User DOB read from database**
2. **Age calculated IN MEMORY**
3. **YES/NO result generated**
4. **Raw DOB immediately discarded**
5. **Only YES/NO stored in proof**
6. **Proof auto-deleted after 5 minutes**

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

## 🚢 Production Deployment

### Security Checklist
- [ ] Use PostgreSQL instead of SQLite
- [ ] Store RSA keys in AWS KMS or HashiCorp Vault
- [ ] Enable HTTPS only
- [ ] Restrict CORS to specific origins
- [ ] Add rate limiting
- [ ] Implement proper authentication
- [ ] Set up monitoring and alerts
- [ ] Enable audit log archival
- [ ] Add proof cleanup job (delete expired proofs)

### Deployment Options
- **Backend**: AWS ECS, Google Cloud Run, Heroku
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: AWS RDS, Google Cloud SQL

## 🤝 Contributing

This is a demo project showcasing privacy-preserving verification. Feel free to:
- Report issues
- Suggest improvements
- Submit pull requests

## 📄 License

MIT License - feel free to use for educational or commercial purposes.

## 🙏 Acknowledgments

Inspired by zero-knowledge proof systems and privacy-preserving cryptography.

---

**Built with ❤️ for privacy**

🔒 **Prüfen** - Prove facts, not data.
