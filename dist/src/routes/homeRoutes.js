// src/routes/homeRoutes.ts
import express from 'express';
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Ana sayfa ve genel bilgiler
 */
/**
 * @swagger
 * /:
 *   get:
 *     summary: Ana sayfa HTML içeriğini gösterir
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Ana sayfa HTML içeriği
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yowa Academy API</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }
            
            .header {
                text-align: center;
                margin-bottom: 3rem;
            }
            
            .logo {
                font-size: 3rem;
                font-weight: bold;
                color: white;
                margin-bottom: 1rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .subtitle {
                font-size: 1.2rem;
                color: rgba(255,255,255,0.9);
                margin-bottom: 2rem;
            }
            
            .card {
                background: white;
                border-radius: 15px;
                padding: 2rem;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            }
            
            .card:hover {
                transform: translateY(-5px);
            }
            
            .card h2 {
                color: #667eea;
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            
            .card p {
                color: #666;
                margin-bottom: 1rem;
            }
            
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                transition: all 0.3s ease;
                margin: 0.5rem;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            .btn-secondary {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }
            
            .feature {
                background: rgba(255,255,255,0.1);
                padding: 1.5rem;
                border-radius: 10px;
                text-align: center;
                backdrop-filter: blur(10px);
            }
            
            .feature h3 {
                color: white;
                margin-bottom: 1rem;
            }
            
            .feature p {
                color: rgba(255,255,255,0.8);
            }
            
            .status {
                display: inline-block;
                padding: 0.5rem 1rem;
                background: #4CAF50;
                color: white;
                border-radius: 20px;
                font-size: 0.9rem;
                margin-bottom: 1rem;
            }
            
            .footer {
                text-align: center;
                color: rgba(255,255,255,0.7);
                margin-top: 3rem;
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 1rem;
                }
                
                .logo {
                    font-size: 2rem;
                }
                
                .features {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎓 Yowa Academy</div>
                <div class="subtitle">Eğitim Platformu API</div>
                <div class="status">🟢 API Aktif</div>
            </div>
            
            <div class="features">
                <div class="feature">
                    <h3>🚀 Hızlı & Güvenli</h3>
                    <p>Modern RESTful API ile hızlı ve güvenli veri transferi</p>
                </div>
                <div class="feature">
                    <h3>📚 Kapsamlı</h3>
                    <p>Kurs yönetimi, kullanıcı sistemi ve daha fazlası</p>
                </div>
                <div class="feature">
                    <h3>🔧 Kolay Entegrasyon</h3>
                    <p>Detaylı dokümantasyon ile kolay entegrasyon</p>
                </div>
            </div>
            
            <div class="card">
                <h2>📖 API Dokümantasyonu</h2>
                <p>Swagger UI ile interaktif API dokümantasyonuna erişin. Tüm endpoint'leri test edebilir, request/response örneklerini görebilirsiniz.</p>
                <a href="/api/docs" class="btn">📖 Dokümantasyonu Görüntüle</a>
            </div>
            
            <div class="card">
                <h2>🔍 API Endpoint'leri</h2>
                <p>Mevcut API endpoint'lerini keşfedin:</p>
                <ul style="margin-left: 2rem; margin-bottom: 1rem; color: #666;">
                    <li><strong>/api/auth</strong> - Kimlik doğrulama işlemleri</li>
                    <li><strong>/api/courses</strong> - Kurs yönetimi</li>
                    <li><strong>/api/categories</strong> - Kategori yönetimi</li>
                    <li><strong>/api/instructors</strong> - Eğitmen işlemleri</li>
                    <li><strong>/api/applications</strong> - Başvuru yönetimi</li>
                    <li><strong>/api/campaigns</strong> - Kampanya yönetimi</li>
                    <li><strong>/api/coupons</strong> - Kupon yönetimi</li>
                    <li><strong>/api/health</strong> - Sistem durumu</li>
                </ul>
                <a href="/api/health" class="btn btn-secondary">🏥 Sistem Durumu</a>
            </div>
            
            <div class="card">
                <h2>🔐 Kimlik Doğrulama</h2>
                <p>API'yi kullanmak için JWT token gereklidir. Token'ı Authorization header'ında "Bearer {token}" formatında gönderin.</p>
                <p><strong>Örnek:</strong> <code>Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code></p>
            </div>
            
            <div class="footer">
                <p>&copy; 2024 Yowa Academy. Tüm hakları saklıdır.</p>
                <p>🚀 Node.js + Express + TypeScript + MongoDB ile geliştirilmiştir.</p>
            </div>
        </div>
    </body>
    </html>
  `;
    res.send(html);
});
export default router;
