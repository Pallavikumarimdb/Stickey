import { useEffect, useState } from "react";

export const useGuestToken = () => {
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem("jwt");
    if (existing) {
      setGuestToken(existing);
      setIsLoaded(true);
      return;
    }

    const fetchToken = async () => {
      try {
        const res = await fetch("/api/guest-token", { method: "POST" });
        const data = await res.json();
        localStorage.setItem("jwt", data.token);
        setGuestToken(data.token);
        setGuestId(data.guestId);
      } catch (e) {
        console.error("Failed to fetch guest token", e);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchToken();
  }, []);

  return { guestToken, guestId, isGuestLoaded: isLoaded };
};
