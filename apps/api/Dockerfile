# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 모노레포 루트 파일 복사
COPY package*.json ./
COPY turbo.json ./

# workspace 패키지 구조 복사
COPY apps/api/package*.json ./apps/api/
COPY packages/eslint-config/package*.json ./packages/eslint-config/
COPY packages/typescript-config/package*.json ./packages/typescript-config/

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

# API 빌드
RUN npm run build --workspace=api

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production

# 필요한 파일만 복사
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# 비루트 사용자로 실행
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

EXPOSE 3000

CMD ["node", "dist/index.js"]
