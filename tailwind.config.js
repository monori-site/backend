const defaultConfig = require('tailwindcss/defaultConfig');

/**
 * Tailwind CSS configuration file made for Arisu.
 *
 * Colour palette was created using [tailwind.ink](https://tailwind.ink/) using the
 * hex value `#EAADFF`.
 */
module.exports = {
  darkMode: 'media',
  mode: 'jit',
  purge: [
    'src/components/**.{ts,tsx}',
    'src/pages/**.{ts,tsx}'
  ],

  fontFamily: {
    mono: [
      '"Jetbrains Mono"',
      ...defaultConfig.theme.fontFamily.mono
    ],
    sans: [
      '"Fira Sans"',
      ...defaultConfig.theme.fontFamily.sans
    ]
  },
  theme: {
    extend: {
      colors: {
        orchid: {
          50: '#fafafb',
          100: '#f3eef9',
          200: '#e7d1f3',
          300: '#eaadff',
          400: '#c27ed1',
          500: '#ac5ac2',
          600: '#923fa9',
          700: '#6f3085',
          800: '#4d215b',
          900: '#2d1634',
        },
        plum: {
          50: '#fafafa',
          100: '#f5eff4',
          200: '#ead4ea',
          300: '#d4acd0',
          400: '#c381b3',
          500: '#ac5e98',
          600: '#90427a',
          700: '#6e325b',
          800: '#4c233d',
          900: '#2d1624',
        },
        chestnut: {
          50: '#fbfaf9',
          100: '#f7efed',
          200: '#efd4da',
          300: '#dcadb5',
          400: '#cd808d',
          500: '#b65e6b',
          600: '#9a434e',
          700: '#76323b',
          800: '#522328',
          900: '#321618',
        },
        sepia: {
          50: '#fbfaf7',
          100: '#f8efdb',
          200: '#f1d7b5',
          300: '#dfb083',
          400: '#cc8555',
          500: '#b26435',
          600: '#964923',
          700: '#73371d',
          800: '#4f2616',
          900: '#33180e',
        },
        olive: {
          50: '#fbf9f4',
          100: '#f8efc9',
          200: '#efdb95',
          300: '#d7b761',
          400: '#b88e38',
          500: '#9a6e1e',
          600: '#7d5514',
          700: '#604012',
          800: '#422c0f',
          900: '#2c1b0b',
        },
        asparagus: {
          50: '#f9f9f4',
          100: '#f5efcf',
          200: '#e8de9e',
          300: '#c9bc6a',
          400: '#9d943e',
          500: '#7c7622',
          600: '#645c17',
          700: '#4e4614',
          800: '#353011',
          900: '#241e0d',
        },
        seagreen: {
          50: '#f4f7f4',
          100: '#e4efeb',
          200: '#c3e2d2',
          300: '#8fc4a8',
          400: '#4fa27a',
          500: '#398553',
          600: '#306d3d',
          700: '#285331',
          800: '#1d3926',
          900: '#14241c',
        },
        teal: {
          50: '#f2f7f6',
          100: '#dceff5',
          200: '#b3e1e9',
          300: '#7ec4cd',
          400: '#43a2ac',
          500: '#31848b',
          600: '#2a6b70',
          700: '#245158',
          800: '#1a3840',
          900: '#11232c',
        },
        steel: {
          50: '#f3f7f8',
          100: '#ddeff8',
          200: '#b6dff0',
          300: '#84c1dc',
          400: '#4e9dc3',
          500: '#3a7eaa',
          600: '#316390',
          700: '#294b71',
          800: '#1e3351',
          900: '#132036',
        },
        denim: {
          50: '#f5f8f9',
          100: '#e2eff9',
          200: '#c2ddf3',
          300: '#94bce3',
          400: '#6497ce',
          500: '#4e75bb',
          600: '#405aa3',
          700: '#334481',
          800: '#242e5b',
          900: '#161d3b',
        }
      }
    }
  }
};
