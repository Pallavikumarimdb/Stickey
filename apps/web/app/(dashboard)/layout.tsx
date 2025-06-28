import { Navbar } from "./_components/navbar";
import { ProjectSidebar } from "./_components/project-sidebar";
import Sidebar from "./_components/sidebar";
import { Providers } from "./providers";

interface DashBoardLayoutProps {
    children?: React.ReactNode;
}

const DashBoardLayout = ({ children }: DashBoardLayoutProps) => {
    return (
        <Providers>
        <main className="h-full">
            <Sidebar />
            <div className="pl-[60px] h-full">
                <div className="flex h-full">
                    <ProjectSidebar />
                    <div className="border-l border-gray-300 h-full" /> 
                    <div className="h-full flex-1">
                        <Navbar />
                        {children}
                    </div>
                </div>
            </div>
        </main>
        </Providers>
    );
};

export default DashBoardLayout;