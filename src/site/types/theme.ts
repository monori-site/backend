import { createMuiTheme } from '@material-ui/core';
import type { Request } from '.';

type ColorTheme = 'dark' | 'light';
type ColorJson = { [x in ColorTheme]: ColorJsonProperties };

interface ColorJsonProperties {
  secondary: string;
  primary: string;
  error: string;
  bg: string;
}

export default function getMuiTheme(req: Request) {
  const colors: ColorJson = require('../../assets/theme.json');
  const theme: ColorJsonProperties = req.session.user ? colors[req.session.user.theme] : colors.light;

  const palette = createMuiTheme({
    palette: {
      primary: { main: theme.primary },
      secondary: { main: theme.secondary },
      error: { main: theme.error },
      background: { default: theme.bg }
    }
  });

  return palette;
}