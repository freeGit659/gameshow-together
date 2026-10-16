# Base image Node.js 20 Alpine siêu nhẹ
FROM node:20-alpine AS runner

WORKDIR /app

# Cài đặt libc6-compat
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --no-audit

# Copy toàn bộ mã nguồn
COPY . .

# Build Next.js
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Expose port (Render/Koyeb thường dùng PORT từ env)
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
