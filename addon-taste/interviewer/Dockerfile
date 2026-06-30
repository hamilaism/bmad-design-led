# Intervieweur de goût — image autoportante (n'impose pas Vercel).
# build :  docker build -t taste-interviewer .
# run   :  docker run -p 3000:3000 --env-file .env.local taste-interviewer

FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Sortie "standalone" de Next : serveur minimal + assets.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
