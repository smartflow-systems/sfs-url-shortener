import { Header } from "../Header";
import { ThemeProvider } from "../theme-provider";

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );
}
