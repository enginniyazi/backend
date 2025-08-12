# Yowa Academy Backend API

Bu proje, Yowa Academy eğitim platformu için Node.js, Express ve TypeScript kullanılarak geliştirilmiş RESTful API'dir.

## 🚀 Özellikler

- **TypeScript** ile tip güvenliği
- **Express.js** web framework
- **MongoDB** veritabanı (Mongoose ODM)
- **JWT** tabanlı kimlik doğrulama
- **Role-based authorization** (Student, Instructor, Admin)
- **File upload** desteği (Multer)
- **Rate limiting** koruması
- **Input validation** middleware
- **Comprehensive testing** (Jest)
- **Logging** sistemi
- **Health check** endpoint'leri

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- MongoDB (yerel veya cloud)
- npm veya yarn

## 🛠️ Kurulum

1. **Projeyi klonlayın:**

```bash
git clone <repository-url>
cd backend
```

2. **Bağımlılıkları yükleyin:**

```bash
npm install
```

3. **Environment dosyasını oluşturun:**

```bash
cp env.example .env
```

4. **Environment değişkenlerini düzenleyin:**

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/yowa_academy
JWT_SECRET=your-super-secret-jwt-key-here
```

5. **Veritabanını başlatın:**

```bash
# MongoDB'yi yerel olarak çalıştırın veya cloud bağlantısı kullanın
```

## 🚀 Çalıştırma

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## 📚 API Dokümantasyonu

### 📖 Swagger UI

API'nin interaktif dokümantasyonuna erişmek için:

```
http://localhost:5001/api/docs
```

### 📋 Postman Collection

Postman ile API'yi test etmek için:

1. `Yowa_Academy_API.postman_collection.json` dosyasını Postman'e import edin
2. Collection variables'da `base_url` değerini ayarlayın
3. "Login User" request'ini çalıştırarak JWT token alın
4. Diğer request'leri test edin

### 🔗 Ana Sayfa

API'nin genel bilgileri için:

```
http://localhost:5001/
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `PUT /api/auth/profile/avatar` - Profil resmi güncelleme

### Categories

- `GET /api/categories` - Tüm kategorileri listele
- `POST /api/categories` - Yeni kategori oluştur
- `PUT /api/categories/:id` - Kategori güncelle
- `DELETE /api/categories/:id` - Kategori sil

### Courses

- `GET /api/courses` - Tüm kursları listele
- `POST /api/courses` - Yeni kurs oluştur
- `GET /api/courses/:id` - Kurs detayı
- `PUT /api/courses/:id` - Kurs güncelle
- `DELETE /api/courses/:id` - Kurs sil

### Instructors

- `GET /api/instructors` - Tüm eğitmenleri listele
- `POST /api/instructors` - Eğitmen başvurusu
- `GET /api/instructors/:id` - Eğitmen detayı

### Applications

- `GET /api/applications` - Başvuruları listele
- `POST /api/applications` - Yeni başvuru
- `PUT /api/applications/:id` - Başvuru durumu güncelle

### Campaigns

- `GET /api/campaigns` - Kampanyaları listele
- `POST /api/campaigns` - Yeni kampanya
- `PUT /api/campaigns/:id` - Kampanya güncelle

### Coupons

- `GET /api/coupons` - Kuponları listele
- `POST /api/coupons` - Yeni kupon
- `PUT /api/coupons/:id` - Kupon güncelle

### Health Check

- `GET /api/health` - Sistem durumu
- `GET /api/health/detailed` - Detaylı sistem durumu

## 🧪 Test

```bash
# Tüm testleri çalıştır
npm test

# Test coverage raporu
npm run test:coverage

# Watch modunda test
npm run test:watch
```

## 🔧 Geliştirme Araçları

### Code Quality

```bash
# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
```

### Build

```bash
# TypeScript derleme
npm run build

# Clean build
npm run clean
```

## 📁 Proje Yapısı

```
src/
├── config/          # Konfigürasyon dosyaları
├── controllers/     # Route controller'ları
├── middleware/      # Express middleware'leri
├── models/          # Mongoose modelleri
├── routes/          # API route'ları
├── types/           # TypeScript tip tanımları
├── utils/           # Yardımcı fonksiyonlar
└── server.ts        # Ana sunucu dosyası

__tests__/           # Test dosyaları
uploads/             # Yüklenen dosyalar
```

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Role-based authorization
- Rate limiting
- Input validation
- File upload güvenliği
- CORS koruması

## 📝 Environment Variables

| Değişken         | Açıklama                       | Varsayılan              |
| ---------------- | ------------------------------ | ----------------------- |
| `PORT`           | Sunucu portu                   | `5001`                  |
| `NODE_ENV`       | Ortam (development/production) | `development`           |
| `MONGO_URI`      | MongoDB bağlantı URI'si        | -                       |
| `JWT_SECRET`     | JWT imzalama anahtarı          | -                       |
| `JWT_EXPIRES_IN` | JWT geçerlilik süresi          | `30d`                   |
| `CORS_ORIGIN`    | CORS izin verilen origin       | `http://localhost:3000` |

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje ISC lisansı altında lisanslanmıştır.

## 🆘 Destek

Herhangi bir sorun yaşarsanız, lütfen issue oluşturun veya iletişime geçin.
