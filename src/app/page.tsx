import { PortfolioPage } from "@/components/features/PortfolioPage";
import { localPortfolioProvider } from "@/config/portfolio";

// DIP: the composition root alone selects the concrete provider.
export default function Home() { return <PortfolioPage provider={localPortfolioProvider} />; }
