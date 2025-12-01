# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 모노레포 루트 파일 복사
COPY package*.json ./
COPY turbo.json ./

# workspace 패키지 구조 복사
COPY apps/web/package*.json ./apps/web/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/eslint-config/package*.json ./packages/eslint-config/
COPY packages/typescript-config/package*.json ./packages/typescript-config/

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY apps/web/ ./apps/web/
COPY packages/ ./packages/

# Next.js 빌드
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=web

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 비루트 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js standalone 출력 복사
COPY --from=builder /app/apps/web/public ./public

# standalone 빌드가 활성화되어 있다면 아래 사용
# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

# 일반 빌드 (standalone 미사용 시)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
