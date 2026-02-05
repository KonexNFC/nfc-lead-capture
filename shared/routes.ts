import { z } from 'zod';
import { insertUserSchema, insertProfileSchema, insertLeadSchema, profiles, leads } from './schema';

export { insertUserSchema, insertProfileSchema, insertLeadSchema };

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.object({ id: z.number(), email: z.string() }),
        400: errorSchemas.validation,
        409: errorSchemas.conflict,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }), // using username field for email to match passport-local defaults
      responses: {
        200: z.object({ id: z.number(), email: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.object({ id: z.number(), email: z.string() }).nullable(),
      },
    },
  },
  profiles: {
    getMine: {
      method: 'GET' as const,
      path: '/api/profile',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    updateMine: {
      method: 'PUT' as const,
      path: '/api/profile',
      input: insertProfileSchema.partial(),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    getBySlug: {
      method: 'GET' as const,
      path: '/api/public/profile/:slug',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    checkSlug: {
      method: 'GET' as const,
      path: '/api/profiles/check-slug/:slug',
      responses: {
        200: z.object({ available: z.boolean() }),
      },
    },
    uploadPhoto: {
      method: 'POST' as const,
      path: '/api/upload',
      responses: {
        200: z.object({ url: z.string() }),
        400: errorSchemas.validation,
      },
    }
  },
  leads: {
    submit: {
      method: 'POST' as const,
      path: '/api/public/leads',
      input: insertLeadSchema.extend({ slug: z.string() }), // Pass slug to identify profile
      responses: {
        201: z.custom<typeof leads.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/leads',
      responses: {
        200: z.array(z.custom<typeof leads.$inferSelect>()),
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/analytics',
      responses: {
        200: z.object({
          totalLeads: z.number(),
          recentLeads: z.array(z.custom<typeof leads.$inferSelect>()),
          // views count would go here if we tracked it in DB
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
