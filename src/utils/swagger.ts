import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Auto-generates OpenAPI spec from JSDoc @swagger annotations in route/controller files.
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description:
        'Production-quality finance dashboard backend with RBAC, financial records management, and dashboard analytics.',
    },
    servers: [{ url: '/', description: 'Root path' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Scan both source and compiled files to support both dev and prod environments
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './dist/routes/*.js', './dist/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
