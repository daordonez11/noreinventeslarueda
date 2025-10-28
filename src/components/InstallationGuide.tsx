'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { itemVariants } from '@/lib/animations/variants'

interface InstallationGuideProps {
  libraryName: string
  locale?: 'es' | 'en'
}

export default function InstallationGuide({
  libraryName,
  locale = 'es',
}: InstallationGuideProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Convert library name to package name (lowercase, remove special chars)
  const packageName = libraryName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')

  const installCommands = [
    {
      manager: 'npm',
      command: `npm install ${packageName}`,
      description: locale === 'es' ? 'Gestor de paquetes de Node.js' : 'Node.js package manager',
    },
    {
      manager: 'yarn',
      command: `yarn add ${packageName}`,
      description: locale === 'es' ? 'Gestor de paquetes Yarn' : 'Yarn package manager',
    },
    {
      manager: 'pnpm',
      command: `pnpm add ${packageName}`,
      description: locale === 'es' ? 'Gestor de paquetes pnpm' : 'pnpm package manager',
    },
  ]

  const handleCopy = (index: number, command: string) => {
    navigator.clipboard.writeText(command)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      variants={itemVariants}
    >
      <h2 className="text-3xl font-bold text-slate-900 mb-8">
        {locale === 'es' ? 'Cómo Instalar' : 'Installation Instructions'}
      </h2>

      <div className="space-y-4">
        {installCommands.map((item, index) => (
          <motion.div
            key={index}
            className="bg-slate-900 rounded-lg p-6 border border-slate-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-brand-400">{item.manager}</span>
                  <span className="text-xs text-slate-400">{item.description}</span>
                </div>
                <code className="text-green-400 font-mono text-sm md:text-base break-all">
                  {item.command}
                </code>
              </div>
              <button
                onClick={() => handleCopy(index, item.command)}
                className="px-3 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 transition-colors font-semibold text-sm whitespace-nowrap flex-shrink-0"
              >
                {copiedIndex === index ? (
                  <>
                    <span>✓</span> {locale === 'es' ? 'Copiado' : 'Copied'}
                  </>
                ) : (
                  <>
                    <span>📋</span> {locale === 'es' ? 'Copiar' : 'Copy'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Import Example */}
      <motion.div
        className="mt-12 bg-white rounded-lg border border-slate-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          {locale === 'es' ? 'Ejemplo de Uso' : 'Usage Example'}
        </h3>
        <div className="bg-slate-100 rounded p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-slate-900">
            {`// CommonJS
const ${packageName.replace(/-/g, '')} = require('${packageName}');

// ES6 Modules
import ${packageName.replace(/-/g, '')} from '${packageName}';`}
          </pre>
        </div>
      </motion.div>

      {/* Additional Resources */}
      <motion.div
        className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-blue-900 mb-2">
          💡 {locale === 'es' ? 'Consejo' : 'Tip'}
        </h3>
        <p className="text-blue-800">
          {locale === 'es'
            ? 'Consulta la documentación oficial del proyecto en GitHub para obtener instrucciones más detalladas y opciones de configuración avanzada.'
            : 'Check the official project documentation on GitHub for detailed setup instructions and advanced configuration options.'}
        </p>
      </motion.div>
    </motion.div>
  )
}
