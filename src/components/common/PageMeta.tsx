import { HelmetProvider, Helmet } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
    <HelmetProvider>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </HelmetProvider>
  </ThemeProvider>
);

export default PageMeta;
