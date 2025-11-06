## StorageApp — A Full‑Scale Cloud Storage Infrastructure Built from Scratch

### Executive Summary

StorageApp is a fully‑functioning cloud storage service architected from zero in six months by **Ashraful Momin**. Rather than cloning existing SaaS templates, every line of code—from database schema and API routes to cache configuration and CI/CD workflows—was hand‑written. The project mirrors enterprise cloud platforms such as Google Drive, Dropbox, and Amazon S3, delivering secure user authentication, tiered subscription billing, efficient object storage, and a responsive React interface.

This repository demonstrates **end‑to‑end ownership** of a production‑ready SaaS. The server tier is a modular **Node.js backend** with clear separation between controllers, services, and middleware. A **Redis cache** stores sessions and query results to minimize round trips to MongoDB. The system integrates payment gateways (Razorpay/Stripe), uses **AWS S3 with CloudFront** to store and distribute files, and is deployed on **AWS EC2 behind an Nginx reverse proxy**. Continuous deployment is automated via **GitHub Actions**, so code pushed to the main branch triggers linting, testing, and zero‑downtime deployment.

---

### Core Highlights

* **CI/CD Automation:** GitHub Actions lint, test, and deploy the app to AWS EC2 with zero downtime.
* **Redis Caching:** Sessions and query results cached for low latency and fast authentication.
* **Microservice-Ready Backend:** Modular Node.js + Express architecture allows easy scaling and service isolation.
* **S3 Object Storage:** AWS S3 (abstracted for MinIO/GCS migration) with pre-signed URL logic.
* **Nginx + SSL + HTTP/2:** Reverse proxy with SSL termination for secure, fast delivery.
* **Secure Auth:** Email OTP & Google OAuth with Redis-backed sessions and role-based access.
* **Payment Integration:** Razorpay/Stripe with webhooks to adjust storage quotas automatically.
* **Transactional Emails:** Resend API for OTP and account notifications.
* **Frontend Experience:** React + Tailwind + Framer Motion for drag-and-drop uploads, context menus, and progress tracking.

---

### Tech Stack

| Layer        | Technologies                                    |
| ------------ | ----------------------------------------------- |
| Frontend     | React, React Router, TailwindCSS, Framer Motion |
| Backend      | Node.js, Express.js                             |
| Database     | MongoDB (Mongoose)                              |
| Cache        | Redis                                           |
| File Storage | AWS S3 (abstracted for MinIO/GCS)               |
| Deployment   | AWS EC2 + Nginx                                 |
| Payment      | Razorpay / Stripe                               |
| CI/CD        | GitHub Actions                                  |
| Email        | Resend API                                      |
| Auth         | Express-Session, Secure Cookies, Google OAuth   |

---

### System Architecture

**Client Layer:** React SPA communicates via REST APIs using secure cookies. Features include folder tree navigation, file previews, and real-time upload progress.

**Gateway (Nginx):** Terminates TLS, proxies requests, and enforces rate-limiting.

**API Layer (Express):** Organized routes (/auth, /files, /subscriptions, etc.) that connect controllers and service layers.

**Caching Layer (Redis):** Stores sessions, OTPs, and query caches with expiration policies.

**Database (MongoDB):** Stores user profiles, file metadata, and directory trees with schema validation.

**Storage (S3):** Pre-signed PUT/GET URLs enable direct uploads/downloads from the client to S3.

**Payment + Webhooks:** Razorpay subscriptions trigger webhook updates for user quotas and plan status.

---

### Performance & Optimization

* **Redis for Fast Lookups:** Minimizes MongoDB hits, ensuring instant auth validation.
* **Pre-Signed URLs:** Offloads heavy file traffic from the server to S3.
* **Async Cleanup:** Recursive deletions handled asynchronously to prevent blocking.
* **CI/CD Automation:** GitHub Actions handle tests, builds, and deployments automatically.
* **Scalability:** Stateless backend allows multiple EC2 instances behind a load balancer.

---

### Cost Efficiency & Roadmap

**Current Deployment:** AWS EC2 (backend) + S3 (storage) + CloudFront (global CDN).

**Optimization:** S3 logic is abstracted, allowing a switch to MinIO or GCS later. Dynamic storage quotas scale with subscription tiers.

**Planned Features:**

* Containerization via ECS/GKE for auto-scaling.
* File versioning & delta uploads.
* Multi-region redundancy.
* AI-powered usage insights & smart file organization.

---

### Development Journey

Ashraful built this project single-handedly over six months—designing schemas, crafting APIs, configuring Redis/S3 integrations, and setting up Nginx + CI/CD pipelines. Every controller, service, and YAML file was written from scratch to understand **how full-scale infrastructure really works**.

---

### Setup Instructions

```bash
git clone https://github.com/asharful70786/StorageApp.git
cd StorageApp/server
npm install
cp .env.example .env
npm start

cd ../client
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** to launch the client.

---

### Folder Structure

```
StorageApp/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── main.jsx
│   └── public/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   └── app.js
└── README.md
```

---

### Future Scalability

* **Multi-region Redis clusters** for global low-latency sessions.
* **CDN caching** for API responses and static assets.
* **File versioning** and collaborative editing using WebSockets.
* **Predictive storage analytics** powered by AI/ML.

---

### Author

**Built by [Ashraful Momin](https://www.ashraful.in/)**
Builder | Full‑Stack Innovator | Architecting scalable, AI‑ready infrastructure for the next generation of digital products.
