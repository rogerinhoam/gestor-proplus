// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Ambiente de teste
    environment: 'jsdom',
    
    // Arquivos de setup
    setupFiles: ['./src/tests/setup.ts'],
    
    // Globals para não precisar importar describe, it, expect
    globals: true,
    
    // Cobertura de código
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/tests/',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'vite.config.ts',
        'vitest.config.ts',
        'tailwind.config.js',
        'postcss.config.js',
        '**/*.d.ts'
      ],
      include: [
        'src/**/*.{ts,tsx}'
      ],
      // Thresholds de cobertura
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Configurações de timeout
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Configurações de retry
    retry: 2,
    
    // Configurações de concorrência
    threads: true,
    maxConcurrency: 5,
    
    // Configurações de watch
    watch: {
      clearScreen: false,
      exclude: ['node_modules', 'dist', 'coverage']
    },
    
    // Configurações de mock
    clearMocks: true,
    restoreMocks: true,
    
    // Configurações de ambiente
    env: {
      NODE_ENV: 'test'
    },
    
    // Configurações de reporter
    reporter: ['verbose', 'html'],
    outputFile: {
      html: './test-results/index.html',
      json: './test-results/results.json'
    },
    
    // Configurações de incluir/excluir
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/tests/**/*.{test,spec}.{ts,tsx}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'coverage/',
      'src/tests/setup.ts',
      'src/tests/mocks/',
      '**/*.d.ts'
    ],
    
    // Configurações de transformação
    transformMode: {
      web: [/\.[jt]sx?$/],
      ssr: [/\.[jt]sx?$/]
    },
    
    // Configurações de browser (para testes e2e futuros)
    browser: {
      enabled: false,
      name: 'chrome',
      headless: true
    },
    
    // Configurações de pool
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true
      }
    },
    
    // Configurações de benchmark (para testes de performance)
    benchmark: {
      include: ['src/**/*.{bench,benchmark}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'cypress']
    },
    
    // Configurações de deps
    deps: {
      inline: [
        '@testing-library/react',
        '@testing-library/jest-dom',
        '@testing-library/user-event'
      ]
    }
  },
  
  // Configurações de resolução
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@features': resolve(__dirname, 'src/features'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@tests': resolve(__dirname, 'src/tests'),
      '@i18n': resolve(__dirname, 'src/i18n')
    }
  },
  
  // Configurações de servidor para testes
  server: {
    port: 3000,
    host: true
  },
  
  // Configurações de build para testes
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          testing: ['@testing-library/react', '@testing-library/jest-dom']
        }
      }
    }
  },
  
  // Configurações de otimização
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'vitest'
    ]
  },
  
  // Configurações de define para variáveis globais
  define: {
    __TEST__: true,
    __DEV__: false,
    __PROD__: false,
    'process.env.NODE_ENV': '"test"'
  },
  
  // Configurações de CSS
  css: {
    modules: {
      classNameStrategy: 'non-scoped'
    }
  },
  
  // Configurações de worker
  worker: {
    format: 'es'
  }
})

// Configuração adicional para diferentes ambientes
export const configs = {
  // Configuração para testes unitários
  unit: defineConfig({
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      exclude: ['src/tests/integration/**', 'src/tests/e2e/**'],
      coverage: {
        thresholds: {
          global: {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85
          }
        }
      }
    }
  }),
  
  // Configuração para testes de integração
  integration: defineConfig({
    test: {
      include: ['src/tests/integration/**/*.test.{ts,tsx}'],
      testTimeout: 30000,
      coverage: {
        thresholds: {
          global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
          }
        }
      }
    }
  }),
  
  // Configuração para testes de componentes
  component: defineConfig({
    test: {
      include: ['src/components/**/*.test.{ts,tsx}', 'src/features/**/*.test.{ts,tsx}'],
      coverage: {
        thresholds: {
          global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
          }
        }
      }
    }
  }),
  
  // Configuração para testes de hooks
  hooks: defineConfig({
    test: {
      include: ['src/hooks/**/*.test.{ts,tsx}'],
      coverage: {
        thresholds: {
          global: {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95
          }
        }
      }
    }
  }),
  
  // Configuração para testes de serviços
  services: defineConfig({
    test: {
      include: ['src/services/**/*.test.{ts,tsx}'],
      coverage: {
        thresholds: {
          global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
          }
        }
      }
    }
  }),
  
  // Configuração para testes de utils
  utils: defineConfig({
    test: {
      include: ['src/utils/**/*.test.{ts,tsx}'],
      coverage: {
        thresholds: {
          global: {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95
          }
        }
      }
    }
  }),
  
  // Configuração para testes de performance
  performance: defineConfig({
    test: {
      include: ['src/**/*.bench.{ts,tsx}', 'src/**/*.perf.{ts,tsx}'],
      benchmark: {
        include: ['src/**/*.{bench,benchmark}.{ts,tsx}'],
        reporters: ['verbose', 'json']
      }
    }
  }),
  
  // Configuração para testes de acessibilidade
  accessibility: defineConfig({
    test: {
      include: ['src/**/*.a11y.{ts,tsx}'],
      setupFiles: ['./src/tests/setup.ts', './src/tests/setup-a11y.ts']
    }
  }),
  
  // Configuração para testes de internacionalização
  i18n: defineConfig({
    test: {
      include: ['src/i18n/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/tests/setup.ts', './src/tests/setup-i18n.ts']
    }
  }),
  
  // Configuração para CI/CD
  ci: defineConfig({
    test: {
      reporter: ['junit', 'json', 'html'],
      outputFile: {
        junit: './test-results/junit.xml',
        json: './test-results/results.json',
        html: './test-results/index.html'
      },
      coverage: {
        reporter: ['text', 'cobertura', 'lcov'],
        reportsDirectory: './coverage'
      },
      maxConcurrency: 3,
      testTimeout: 15000,
      bail: 1
    }
  })
}

// Scripts utilitários para package.json
export const scripts = {
  // Testes básicos
  "test": "vitest",
  "test:run": "vitest run",
  "test:ui": "vitest --ui",
  "test:watch": "vitest --watch",
  
  // Testes por categoria
  "test:unit": "vitest --config vitest.config.unit.ts",
  "test:integration": "vitest --config vitest.config.integration.ts",
  "test:component": "vitest --config vitest.config.component.ts",
  "test:hooks": "vitest --config vitest.config.hooks.ts",
  "test:services": "vitest --config vitest.config.services.ts",
  "test:utils": "vitest --config vitest.config.utils.ts",
  
  // Testes especializados
  "test:a11y": "vitest --config vitest.config.accessibility.ts",
  "test:i18n": "vitest --config vitest.config.i18n.ts",
  "test:perf": "vitest --config vitest.config.performance.ts",
  
  // Cobertura
  "test:coverage": "vitest run --coverage",
  "test:coverage:ui": "vitest --coverage --ui",
  "test:coverage:watch": "vitest --coverage --watch",
  
  // CI/CD
  "test:ci": "vitest run --config vitest.config.ci.ts",
  "test:ci:coverage": "vitest run --config vitest.config.ci.ts --coverage",
  
  // Benchmark
  "bench": "vitest bench",
  "bench:run": "vitest bench --run",
  
  // Utilitários
  "test:debug": "vitest --inspect-brk --no-coverage",
  "test:related": "vitest related",
  "test:changed": "vitest run --changed",
  "test:clear-cache": "vitest run --clear-cache"
}

// Configuração de matchers personalizados
export const customMatchers = {
  // Matcher para validar moeda
  toBeValidCurrency: (received: number) => {
    const pass = typeof received === 'number' && received >= 0 && 
                 Number.isFinite(received) && 
                 Number(received.toFixed(2)) === received
    
    return {
      message: () => pass 
        ? `expected ${received} not to be a valid currency value`
        : `expected ${received} to be a valid currency value`,
      pass
    }
  },
  
  // Matcher para validar data
  toBeValidDate: (received: any) => {
    const pass = received instanceof Date && !isNaN(received.getTime())
    
    return {
      message: () => pass 
        ? `expected ${received} not to be a valid date`
        : `expected ${received} to be a valid date`,
      pass
    }
  },
  
  // Matcher para validar CNPJ
  toBeValidCNPJ: (received: string) => {
    const cleanCNPJ = String(received).replace(/\D/g, '')
    const pass = cleanCNPJ.length === 14 && !/^(\d)\1+$/.test(cleanCNPJ)
    
    return {
      message: () => pass 
        ? `expected ${received} not to be a valid CNPJ`
        : `expected ${received} to be a valid CNPJ`,
      pass
    }
  },
  
  // Matcher para validar telefone
  toBeValidPhone: (received: string) => {
    const cleanPhone = String(received).replace(/\D/g, '')
    const pass = cleanPhone.length === 10 || cleanPhone.length === 11
    
    return {
      message: () => pass 
        ? `expected ${received} not to be a valid phone number`
        : `expected ${received} to be a valid phone number`,
      pass
    }
  }
}

// Configuração de setup para diferentes tipos de teste
export const setupFiles = {
  // Setup básico
  basic: './src/tests/setup.ts',
  
  // Setup para testes de componentes React
  react: './src/tests/setup-react.ts',
  
  // Setup para testes de acessibilidade
  a11y: './src/tests/setup-a11y.ts',
  
  // Setup para testes de internacionalização
  i18n: './src/tests/setup-i18n.ts',
  
  // Setup para testes de performance
  performance: './src/tests/setup-performance.ts',
  
  // Setup para testes de integração
  integration: './src/tests/setup-integration.ts'
}

// Configuração de mocks globais
export const globalMocks = {
  // Mock do localStorage
  localStorage: {
    getItem: 'vi.fn()',
    setItem: 'vi.fn()',
    removeItem: 'vi.fn()',
    clear: 'vi.fn()'
  },
  
  // Mock do fetch
  fetch: 'vi.fn()',
  
  // Mock de APIs do navegador
  navigator: {
    clipboard: {
      writeText: 'vi.fn()',
      readText: 'vi.fn()'
    }
  },
  
  // Mock de IntersectionObserver
  IntersectionObserver: 'vi.fn()',
  
  // Mock de ResizeObserver
  ResizeObserver: 'vi.fn()',
  
  // Mock de matchMedia
  matchMedia: 'vi.fn()'
}
