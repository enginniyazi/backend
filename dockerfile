# 1. Adım: Derleme ortamını kur
FROM node:20.19.0

# Uygulama dizinini oluştur
WORKDIR /usr/src/app

# Bağımlılıkları kopyala ve yükle (bu katman cache'lenir)
COPY package*.json ./
RUN npm install

# Tüm proje dosyalarını kopyala
COPY . .

# Eğer TypeScript gibi bir derleme adımınız varsa (opsiyonel)
# RUN npm run build

# 2. Adım: Üretim (production) ortamını kur
FROM node:20.19.0

WORKDIR /usr/src/app

# Sadece gerekli bağımlılıkları yükle
COPY package*.json ./
RUN npm ci --only=production

# Derlenmiş dosyaları ve diğer gerekli dosyaları kopyala
COPY . .
# Eğer bir 'build' adımınız varsa, aşağıdaki satırı kullanın:
# COPY --from=builder /usr/src/app/dist ./dist

# Uygulamayı çalıştıracak portu belirt
EXPOSE 3000

# Uygulamayı başlat
CMD [ "node", "server.js" ]