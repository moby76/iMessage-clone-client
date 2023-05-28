//Перехват и установка пользовательских настроек библиотеки темизации chakra-ui

// 1. Import `extendTheme`
import { extendTheme, ThemeConfig } from "@chakra-ui/react"

const config: ThemeConfig = {
  initialColorMode: 'dark',//цвет по умолчанию
  useSystemColorMode: false
}

// 2. Call `extendTheme` and pass your custom values
export const theme = extendTheme(
  { config },
  {
    colors: {
      brand: {
        100: "#3D84F7",
      },
    },
    styles: {
      global: () => ({
        body: {
          bg: "whiteAlpha.200",
        },
      }),
    },
  }
);
