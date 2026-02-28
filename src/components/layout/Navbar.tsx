import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Code2,
  LogOut,
  Moon,
  Sun,
  User,
  Trophy,
  Plus,
  LayoutDashboard,
  Settings,
  Code,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect after logout
  };

  const mobileNavLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/leetcode", label: "Challenges", icon: Code },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/create-challenge", label: "New Challenge", icon: Plus },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="group flex items-center gap-2 font-semibold transition-all duration-200 ease-out hover:text-primary"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary transition-transform duration-200 group-hover:scale-105">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden text-lg sm:inline-block">
            LeetCode Tracker
          </span>
        </Link>

        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="transition-all duration-200 hover:scale-[1.04]"
            >
              <Link to="/" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/leaderboard" className="gap-2">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/leetcode" className="gap-2">
                <Code className="h-4 w-4" />
                LeetCode
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/create-challenge" className="gap-2">
                <Plus className="h-4 w-4" />
                New Challenge
              </Link>
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Mobile hamburger menu */}
          {isAuthenticated && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <SheetContent side="left" className="w-72">
                <SheetHeader className="pb-4 border-b border-border">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                      <Code2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                    Navigation
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 pt-4">
                  {mobileNavLinks.map(({ to, label, icon: Icon }) => (
                    <SheetClose asChild key={to}>
                      <Link
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="my-2 border-t border-border" />
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Auth buttons / user avatar */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full transition-transform duration-200 hover:scale-105"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="gap-2 cursor-pointer text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="gradient-primary">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
