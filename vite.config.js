import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, join, dirname } from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Plugin to copy static folders to dist
function copyStaticFolders() {
  return {
    name: 'copy-static-folders',
    writeBundle() {
      const foldersToCopy = ['data', 'images', 'audio']
      const distPath = resolve(__dirname, 'dist')
      
      foldersToCopy.forEach(folder => {
        const srcPath = resolve(__dirname, folder)
        const destPath = join(distPath, folder)
        
        if (existsSync(srcPath)) {
          copyRecursiveSync(srcPath, destPath)
          console.log(`✓ Copied ${folder}/ to dist/`)
        }
      })
      
      // Create .nojekyll file to prevent Jekyll processing on GitHub Pages
      const nojekyllPath = join(distPath, '.nojekyll')
      writeFileSync(nojekyllPath, '')
      console.log(`✓ Created .nojekyll file`)
    }
  }
}

function copyRecursiveSync(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }
  
  const entries = readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyStaticFolders()],
  base: '/portfolio/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB to suppress warning
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']
      }
    }
  }
})