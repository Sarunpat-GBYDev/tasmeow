import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) ตอนเปิดแอป: ดึง session ที่ค้างอยู่ใน AsyncStorage (ถ้าเคย login ไว้)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 2) หลังจากนั้น: ฟังทุกการเปลี่ยนแปลง (login สำเร็จ, logout, token หมดอายุ)
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// เรียกใช้จาก component ไหนก็ได้: const { session } = useAuth()
export const useAuth = () => useContext(AuthContext);
