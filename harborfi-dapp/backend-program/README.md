# HarborFi Backend Program

This is the backend service for **HarborFi**, a decentralized fiat-to-crypto ramp platform. It handles transactions between users and the blockchain via [Pharos Network](https://pharos.network) and payment processing via [Xendit](https://www.xendit.co/en/). The database layer is managed using [Prisma ORM](https://www.prisma.io/).

---

## 🔧 Tech Stack

- **Node.js** + **TypeScript**
- **Pharos Network RPC** (EVM-compatible)
- **Xendit API** for payments (QRIS & Virtual Account)
- **Prisma** for database ORM
- **PostgreSQL** (or your preferred DB)
- Directory structure:
  - `src/routes`: API routes (e.g., `/transaction`)
  - `src/services`: business logic like Xendit and blockchain handling
  - `src/jobs`: background jobs like transaction monitoring
  - `src/tools`: utility functions
  - `src/actions`: user actions / transaction builders

---

## 🚀 Getting Started

### 1. Install dependencies

npm install

### 2. Prepare environment

Set up the .env with
DATABASE_URL=your_postgres_connection_url
XENDIT_API_KEY=your_xendit_private_key
PRIVATE_KEY=deployer_private_key_for_pharos
PHAROS_RPC_URL=https://devnet.dplabs-internal.com

If you need to custom the port to run you can modify in the index.ts, don't forget also to adjust to the client side also for interact with the backend program.


### 3. Run the program, 
npx ts-node src/index.ts

### 4. Check the transaction data by run, 
npx prisma studio
