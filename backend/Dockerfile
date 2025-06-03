FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

# Copia o código-fonte
COPY . .

# Instala tipos TypeScript necessários (se não estiverem no package.json)
RUN npm install --save-dev @types/jsonwebtoken @types/uuid

# Compila o código TypeScript
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Copia apenas os arquivos compilados e o package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci 

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

# Limpa arquivos desnecessários do processo de build
RUN rm -rf /app/node_modules /app/.npmrc /app/.nvm /app/.cache

# Exposição da porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]