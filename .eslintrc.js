module.exports = {
  extends: ['wxb-typescript'],
  rules: {
    // 禁止使用 var
    'no-var': 'error',
    // 优先使用 interface 而不是 type
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    'linebreak-style': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowDestructuring: true,
        allowedNames: ['self', 'that']
      }
    ],
    // 允许使用 arguments
    'prefer-rest-params': 0,
    // 允许使用 ts-ignore
    '@typescript-eslint/ban-ts-comment': 0
  }
}
