interface LayoutProps {
    children : React.ReactNode
}

const Layout = ({
    children
}:LayoutProps) => {
    return (
        <div>
            <nav className="bg-red-500 text-white-900 text-center p-4 sm:p-6 lg:p-8">
                I am a nav
            </nav>
            {children}
        </div>
    )
}

export default Layout