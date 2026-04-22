"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LoginModal } from "@/components/LoginModal";

export function GlobalAuthModal() {
  const pathname = usePathname();
  const { isAuthenticated, isLoginModalOpen, setLoginModalOpen } = useAuthStore();

  // Rules:
  // 1. Landing page (/) is public, modal can be closed.
  // 2. All other pages are private, modal is mandatory and cannot be closed.
  const isLandingPage = pathname === "/";
  const isClosable = isLandingPage;

  useEffect(() => {
    // If not authenticated and not on landing page, force open the modal
    if (!isAuthenticated && !isLandingPage) {
      setLoginModalOpen(true);
    }
  }, [isAuthenticated, isLandingPage, setLoginModalOpen]);

  return (
    <LoginModal 
      isOpen={isLoginModalOpen} 
      onClose={() => isClosable && setLoginModalOpen(false)} 
      isClosable={isClosable}
    />
  );
}
