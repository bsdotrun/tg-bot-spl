# Deployment Guide

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run in development mode
npm run dev
```

---

## Production Deployment

### Option 1: VPS Deployment (Recommended)

#### 1. Choose a VPS Provider
- **DigitalOcean** - Starting at $6/month
- **Linode** - Starting at $5/month
- **Vultr** - Starting at $5/month
- **AWS EC2** - Pay as you go

#### 2. Server Requirements
- **OS**: Ubuntu 22.04 LTS
- **RAM**: Minimum 2GB
- **CPU**: 1 vCPU
- **Storage**: 25GB SSD
- **Network**: Good connectivity for low latency

#### 3. Setup Steps

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Create app directory
mkdir -p /opt/bloom-bot
cd /opt/bloom-bot

# Clone your repository (or upload files)
git clone your-repo-url .

# Install dependencies
npm install

# Build the project
npm run build

# Configure environment
nano .env
# Add your credentials

# Start with PM2
pm2 start dist/index.js --name bloom-bot

# Enable auto-start on reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs bloom-bot
```

#### 4. Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
apt install -y nginx

# Create config
nano /etc/nginx/sites-available/bloom-bot

# Add webhook endpoint config (if needed)
# Save and enable
ln -s /etc/nginx/sites-available/bloom-bot /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 5. SSL Certificate (Optional)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com
```

---

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  bloom-bot:
    build: .
    restart: always
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### 3. Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart
```

---

### Option 3: Serverless (AWS Lambda)

This is more complex but can be cost-effective for low-traffic bots.

#### Requirements
- AWS account
- Serverless Framework or AWS SAM

```bash
# Install Serverless Framework
npm install -g serverless

# Configure AWS credentials
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET

# Deploy
serverless deploy
```

---

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# Status
pm2 status

# Logs
pm2 logs bloom-bot

# Restart
pm2 restart bloom-bot

# Stop
pm2 stop bloom-bot

# Memory usage
pm2 monit
```

### Log Management

```bash
# View logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log

# Rotate logs (already configured in Winston)
# Logs auto-rotate at 5MB
```

### System Monitoring

```bash
# CPU & Memory
htop

# Disk usage
df -h

# Network
netstat -tuln
```

---

## Database Setup (Optional)

### MongoDB (Recommended for production)

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Secure MongoDB
mongo
> use admin
> db.createUser({user:"bloom",pwd:"your_password",roles:["root"]})
> exit

# Update .env
DATABASE_URL=mongodb://bloom:your_password@localhost:27017/bloom-bot
```

### PostgreSQL (Alternative)

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE bloom_bot;
CREATE USER bloom WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bloom_bot TO bloom;
\q

# Update .env
DATABASE_URL=postgresql://bloom:your_password@localhost:5432/bloom_bot
```

---

## Security Hardening

### 1. Firewall Setup

```bash
# Install UFW
apt install -y ufw

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. Fail2Ban

```bash
# Install Fail2Ban
apt install -y fail2ban

# Configure
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
nano /etc/fail2ban/jail.local

# Enable
systemctl enable fail2ban
systemctl start fail2ban
```

### 3. Secure SSH

```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Disable root login
PermitRootLogin no

# Use key-based auth only
PasswordAuthentication no

# Restart SSH
systemctl restart sshd
```

### 4. Environment Security

```bash
# Set proper permissions
chmod 600 .env
chown bloom-bot:bloom-bot .env

# Use encryption for sensitive data
# Already implemented in the bot
```

---

## Backup Strategy

### 1. Automated Backups

```bash
# Create backup script
nano /opt/backup-bloom.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup data directory
tar -czf $BACKUP_DIR/bloom-data-$DATE.tar.gz /opt/bloom-bot/data

# Backup database (if using MongoDB)
mongodump --uri="mongodb://localhost:27017/bloom-bot" --out=$BACKUP_DIR/db-$DATE

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /opt/backup-bloom.sh

# Add to cron (daily at 2 AM)
crontab -e
0 2 * * * /opt/backup-bloom.sh
```

### 2. Off-site Backup

```bash
# Install rclone for cloud backups
curl https://rclone.org/install.sh | bash

# Configure (follow prompts)
rclone config

# Sync to cloud
rclone sync /opt/backups remote:bloom-backups
```

---

## Performance Optimization

### 1. Node.js Optimization

```bash
# Increase memory limit if needed
pm2 start dist/index.js --name bloom-bot --max-memory-restart 500M

# Use cluster mode for multiple instances
pm2 start dist/index.js --name bloom-bot -i 2
```

### 2. Database Indexing

```javascript
// MongoDB indexes
db.users.createIndex({ "id": 1 })
db.trades.createIndex({ "userId": 1, "timestamp": -1 })
db.wallets.createIndex({ "publicKey": 1 })
```

### 3. Caching

Already implemented with node-cache. Adjust TTL as needed:

```typescript
// In userService.ts
this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour
```

---

## Troubleshooting

### Bot not responding
```bash
# Check if running
pm2 status

# Check logs
pm2 logs bloom-bot --lines 100

# Restart
pm2 restart bloom-bot
```

### High memory usage
```bash
# Monitor
pm2 monit

# Restart with memory limit
pm2 restart bloom-bot --max-memory-restart 500M
```

### Database connection issues
```bash
# Check MongoDB status
systemctl status mongod

# View MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
systemctl restart mongod
```

### RPC issues
- Switch to backup RPC endpoint
- Check RPC provider status
- Increase timeout values

---

## Scaling

### Horizontal Scaling

For high-traffic scenarios:

1. **Load Balancer**: Nginx or HAProxy
2. **Multiple Bot Instances**: Use PM2 cluster mode
3. **Redis**: For shared session storage
4. **Message Queue**: RabbitMQ or Redis for job processing

### Vertical Scaling

Upgrade server resources:
- More CPU cores
- Additional RAM
- Faster SSD storage
- Better network bandwidth

---

## Cost Estimation

### Monthly Costs

| Item | Cost |
|------|------|
| VPS (2GB RAM) | $5-10 |
| Domain (optional) | $1-2 |
| RPC (Helius Pro) | $49-99 |
| Monitoring (optional) | $0-10 |
| **Total** | **$55-121/month** |

### Free Tier Options

- VPS: Oracle Cloud (free tier)
- RPC: Public endpoints (rate limited)
- Database: MongoDB Atlas (free 512MB)
- Monitoring: PM2 built-in

---

## Support & Resources

- Documentation: See README.md and FEATURES.md
- Logs: `/opt/bloom-bot/logs/`
- PM2 Docs: https://pm2.keymetrics.io/
- Solana Docs: https://docs.solana.com/
- Jupiter Docs: https://docs.jup.ag/

---

**Ready to deploy? Follow the Quick Start guide above!** 🚀
