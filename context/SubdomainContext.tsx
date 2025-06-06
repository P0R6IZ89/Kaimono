"use client";

import { useParams } from "next/navigation";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface SubdomainContextValue {
  subdomain: string;
  setSubdomain: (value: string) => void;
}

const SubdomainContext = createContext<SubdomainContextValue | undefined>(
  undefined
);

interface SubdomainContextProviderProps {
  children: ReactNode;
}

export default function SubdomainContextProvider({
  children,
}: SubdomainContextProviderProps) {
  const params = useParams();
  const currentSubdomain = params.subdomain as string;
  const [subdomain, setSubdomain] = useState<string>(currentSubdomain);
  useEffect(() => {
    if (currentSubdomain && currentSubdomain !== subdomain) {
      setSubdomain(currentSubdomain);
    }
  }, [currentSubdomain, subdomain]);
  return (
    <SubdomainContext.Provider value={{ subdomain, setSubdomain }}>
      {children}
    </SubdomainContext.Provider>
  );
}
export function useSubdomain(): SubdomainContextValue {
  const context = useContext(SubdomainContext);
  if (!context) {
    throw new Error(
      "useSubdomain must be used within a SubdomainContextProvider"
    );
  }
  return context;
}
