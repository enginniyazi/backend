// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Yowa Academy API',
      version: '1.0.0',
      description: 'Yowa Academy eğitim platformu için RESTful API dokümantasyonu',
      contact: {
        name: 'Yowa Academy Team',
        email: 'info@yowaacademy.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
      },
      {
        url: 'http://yowa-backend.213.142.134.129.nip.io/',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Kullanıcı ID',
            },
            name: {
              type: 'string',
              description: 'Kullanıcı adı',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'E-posta adresi',
            },
            avatar: {
              type: 'string',
              description: 'Profil resmi URL',
            },
            role: {
              type: 'string',
              enum: ['Student', 'Instructor', 'Admin'],
              description: 'Kullanıcı rolü',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Güncellenme tarihi',
            },
          },
        },
        Course: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Kurs ID',
            },
            title: {
              type: 'string',
              description: 'Kurs başlığı',
            },
            description: {
              type: 'string',
              description: 'Kurs açıklaması',
            },
            price: {
              type: 'number',
              description: 'Kurs fiyatı',
            },
            coverImage: {
              type: 'string',
              description: 'Kurs kapak resmi URL',
            },
            isPublished: {
              type: 'boolean',
              description: 'Yayın durumu',
            },
            instructor: {
              $ref: '#/components/schemas/User',
            },
            category: {
              type: 'string',
              description: 'Kategori ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Güncellenme tarihi',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Kategori ID',
            },
            name: {
              type: 'string',
              description: 'Kategori adı',
            },
            description: {
              type: 'string',
              description: 'Kategori açıklaması',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Güncellenme tarihi',
            },
          },
        },
        InstructorApplication: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Başvuru ID',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            bio: {
              type: 'string',
              description: 'Eğitmen biyografisi',
            },
            expertise: {
              type: 'string',
              description: 'Uzmanlık alanları',
            },
            experience: {
              type: 'string',
              description: 'Deneyim süresi',
            },
            education: {
              type: 'string',
              description: 'Eğitim bilgileri',
            },
            status: {
              type: 'string',
              enum: ['Submitted', 'Reviewed', 'Contacted', 'Closed'],
              description: 'Başvuru durumu',
            },
            adminNotes: {
              type: 'string',
              description: 'Admin notları',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Güncellenme tarihi',
            },
          },
        },
        Application: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Başvuru ID',
            },
            courseId: {
              type: 'string',
              description: 'Kurs ID',
            },
            name: {
              type: 'string',
              description: 'Başvuran kişinin adı',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'E-posta adresi',
            },
            phone: {
              type: 'string',
              description: 'Telefon numarası',
            },
            message: {
              type: 'string',
              description: 'Başvuru mesajı',
            },
            status: {
              type: 'string',
              enum: ['Submitted', 'Reviewed', 'Contacted', 'Closed'],
              description: 'Başvuru durumu',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Güncellenme tarihi',
            },
          },
        },
        Campaign: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Kampanya ID',
            },
            title: {
              type: 'string',
              description: 'Kampanya başlığı',
            },
            description: {
              type: 'string',
              description: 'Kampanya açıklaması',
            },
            discountPercentage: {
              type: 'number',
              description: 'İndirim yüzdesi',
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Başlangıç tarihi',
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Bitiş tarihi',
            },
            courseId: {
              type: 'string',
              description: 'Kampanya uygulanacak kurs ID',
            },
            isActive: {
              type: 'boolean',
              description: 'Kampanya aktif mi',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Güncellenme tarihi',
            },
          },
        },
        Coupon: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Kupon ID',
            },
            code: {
              type: 'string',
              description: 'Kupon kodu',
            },
            discountType: {
              type: 'string',
              enum: ['percentage', 'fixed'],
              description: 'İndirim tipi',
            },
            discountValue: {
              type: 'number',
              description: 'İndirim değeri',
            },
            maxUses: {
              type: 'number',
              description: 'Maksimum kullanım sayısı',
            },
            currentUses: {
              type: 'number',
              description: 'Mevcut kullanım sayısı',
            },
            expiryDate: {
              type: 'string',
              format: 'date',
              description: 'Son kullanma tarihi',
            },
            isActive: {
              type: 'boolean',
              description: 'Kupon aktif mi',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Güncellenme tarihi',
            },
          },
        },
        HealthStatus: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['OK', 'ERROR'],
              description: 'Sistem durumu',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Kontrol zamanı',
            },
            uptime: {
              type: 'number',
              description: 'Sistem çalışma süresi (saniye)',
            },
            environment: {
              type: 'string',
              description: 'Çalışma ortamı',
            },
            database: {
              type: 'string',
              enum: ['connected', 'disconnected'],
              description: 'Veritabanı bağlantı durumu',
            },
            memory: {
              type: 'object',
              properties: {
                used: {
                  type: 'number',
                  description: 'Kullanılan bellek (MB)',
                },
                total: {
                  type: 'number',
                  description: 'Toplam bellek (MB)',
                },
              },
            },
          },
        },
        Enrollment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Kayıt ID',
              example: '60d5ec49f8c7a2001c8a4d1a',
            },
            user: {
              type: 'string',
              description: 'Kullanıcı ID',
              example: '60d5ec49f8c7a2001c8a4d1b',
            },
            course: {
              type: 'string',
              description: 'Kurs ID',
              example: '60d5ec49f8c7a2001c8a4d1c',
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'completed', 'failed'],
              description: 'Ödeme durumu',
              example: 'completed',
            },
            enrolledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Kayıt tarihi',
              example: '2023-10-27T10:00:00Z',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Hata mesajı',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Validation hataları',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // API dosyalarının yolları
};

export const specs = swaggerJsdoc(options);