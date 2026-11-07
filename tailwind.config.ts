module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 12px 30px rgba(15, 23, 42, 0.15)',
      },
      colors: {
        brand: {
          50: '#f7f7f7',
          100: '#efefef',
          500: '#f59e0b',
          600: '#d97706',
          900: '#0f172a'
        }
      }
    }
  },
  plugins: []
};
