/**
 * This file was automatically generated based on your preset configuration.
 *
 * For better type checking and IntelliSense:
 * 1. Install azion as dev dependency:
 *    npm install -D azion
 *
 * 2. Use defineConfig:
 *    import { defineConfig } from 'azion'
 *
 * For more configuration options, visit:
 * https://github.com/aziontech/azion
 */

export default {
  build: {
    preset: 'react',
    polyfills: true,
    worker: false
  },
  origin: [
    {
      name: 'origin-storage-default',
      type: 'object_storage'
    }
  ],
  rules: {
    request: [
      {
        name: 'Set Storage Origin for All Requests',
        match: '^\\/',
        behavior: {
          setOrigin: {
            name: 'origin-storage-default',
            type: 'object_storage'
          }
        }
      },
      {
        name: 'Deliver Static Assets',
        match:
          '.(css|js|ttf|woff|woff2|pdf|svg|jpg|jpeg|gif|bmp|png|ico|mp4|json|xml|html)$',
        behavior: {
          setOrigin: {
            name: 'origin-storage-default',
            type: 'object_storage'
          },
          deliver: true
        }
      },
      {
        name: 'Redirect to index.html',
        match: '^\\/',
        behavior: {
          rewrite: '/index.html'
        }
      }
    ]
  },
  functions: [
    {
      name: 'handler',
      path: '.edge/worker.js'
    }
  ]
}
