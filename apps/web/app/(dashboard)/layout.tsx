
import { Navbar } from "./_components/navbar";
import { ProjectSidebar } from "./_components/project-sidebar";
import Sidebar from "./_components/sidebar";

interface DashBoardLayoutProps {
    children?: React.ReactNode;
}

const DashBoardLayout = ({ children }: DashBoardLayoutProps) => {
    return (
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
    );
};

export default DashBoardLayout;