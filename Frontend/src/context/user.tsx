"use client";

import { DecodedToken, IUser, IUserContext, IUserResponse, SignInCredential } from "@/interfaces/interfaces";
import { fetchUserData, postSignIn, postSignUp } from "@/lib/server/fetchUsers";
import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export const UserContext = createContext<IUserContext>({
    user: null,
    setUser: () => {},
    isLogged: false,
    setIsLogged: () => {},
    signIn: async () => false,
    signUp: async (user: Omit<IUser, "id">) => ({ success: false, errorMessage: '' }),
    logOut: () => {},
    imgUrl: null,
    setImgUrl: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<Partial<IUser> | null>(null);
    const [isLogged, setIsLogged] = useState<boolean>(false);
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const router = useRouter();
    const { data: session, status } = useSession();
    console.log("🚀 ~ UserProvider ~ status:", status);
    console.log("🚀 ~ UserProvider ~ session:", session);

    const signIn = async (credentials: SignInCredential): Promise<boolean> => {
      try {
        let data: IUserResponse | null;
    
        if ('provider' in credentials) {
          return true;
        } else {
          const userResponse = await postSignIn(credentials);
          if (userResponse) {
            data = { user: userResponse.user, token: userResponse.token };
          } else {
            data = null;
          }
        }
    
        if (data && data.token) {
          const decodedToken: DecodedToken = jwtDecode(data.token);
          const role = decodedToken.roles;
          const userId = decodedToken.id;
    
          const userWithRole = {
            ...data.user,
            role: role,
            id: userId,
            token: data.token,
          };
    
          // Llamar a fetchUserData y obtener imgUrl y otros datos
          const fetchedUserData = await fetchUserData(userId, data.token);
          
          if (fetchedUserData) {
            setUser({ ...userWithRole, ...fetchedUserData });
            setImgUrl(fetchedUserData.imgUrl || null);
            localStorage.setItem(`imgUrl_${userId}`, fetchedUserData.imgUrl || '');
          }
    
          localStorage.setItem('user', JSON.stringify(userWithRole));
          localStorage.setItem('token', data.token);
    
          setIsLogged(true);
          return true;
        }
    
        console.warn("No se pudo iniciar sesión, datos no válidos:", data);
        return false;
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error durante el login:', error.message);
        } else {
          console.error('Error inesperado durante el login:', error);
        }
        return false;
      }
    };
    

    const signUp = async (user: Omit<IUser, "id">): Promise<{ success: boolean; errorMessage?: string }> => {
        try {
            console.log("Llamando a postSignUp con:", user);
            const data = await postSignUp(user);
            console.log("Respuesta recibida en signUp:", data);

            if (data && data.user && data.user.id) {
                console.log("Usuario registrado correctamente:", data.user);
                await signIn({ email: user.email, password: user.password });
                setImgUrl(data.user.imgUrl);
                return { success: true };
            } else {
                console.log("La respuesta no contiene el usuario o el ID:", data);
                return { success: false, errorMessage: "No se pudo obtener el ID del usuario." };
            }
        } catch (error) {
            console.error("Error en signUp:", error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el registro';
            return { success: false, errorMessage };
        }
    };

    const logOut = async () => {
      // Mostrar el diálogo de confirmación con SweetAlert2
      const result = await Swal.fire({
          title: 'Are you sure?',
          text: "You'll need to log in again to access your account",
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, logout',
          cancelButtonText: 'Cancel',
          customClass: {
              popup: 'bg-zinc-900 text-white',
              title: 'text-white',
              htmlContainer: 'text-gray-300',
              actions: 'flex justify-center gap-4', // Add gap between buttons
              confirmButton: 'bg-red-600 text-white hover:bg-red-700 py-2 px-4 rounded-md transition-colors duration-200',
              cancelButton: 'bg-gray-600 text-white hover:bg-gray-700 py-2 px-4 rounded-md transition-colors duration-200',
          },
          buttonsStyling: false,
          background: '#18181B', // zinc-900
          iconColor: '#DC2626', // red-600
          reverseButtons: true,
          focusConfirm: false,
          showClass: {
              popup: 'animate__animated animate__fadeInDown animate__faster'
          },
          hideClass: {
              popup: 'animate__animated animate__fadeOutUp animate__faster'
          }
      });

      // Si el usuario confirma, proceder con el logout
      if (result.isConfirmed) {
          const userId = user?.id;
          if (userId) {
              localStorage.removeItem(`imgUrl_${userId}`);
          }
          localStorage.removeItem("user");
          localStorage.removeItem("token");

          setUser(null);
          setIsLogged(false);
          setImgUrl(null);

          // Mostrar mensaje de despedida
          Swal.fire({
              title: 'Come back soon!',
              text: "You've been logged out successfully",
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
              customClass: {
                  popup: 'bg-zinc-900 text-white',
                  title: 'text-red-600',
              },
              background: '#18181B',
              iconColor: '#DC2626',
              showClass: {
                  popup: 'animate__animated animate__fadeInDown animate__faster'
              },
              hideClass: {
                  popup: 'animate__animated animate__fadeOutUp animate__faster'
              }
          });
      }
  };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
    
        if (storedUser && token) {
            const parsedUser = JSON.parse(storedUser);
            try {
                const decodedToken: DecodedToken = jwtDecode(token);
                const role = decodedToken.roles;
                const userId = parsedUser.id;
    
                // Recupera la imagen de perfil específica para este usuario
                const savedImgUrl = localStorage.getItem(`imgUrl_${userId}`);
                setUser({
                    ...parsedUser,
                    role: role,
                    id: decodedToken.id,
                });
                setImgUrl(savedImgUrl || null);
                setIsLogged(true);
            } catch (error) {
                console.warn("Error al decodificar el token:", error);
            }
        }
    }, []);
    
    
    

    return (
        <UserContext.Provider
            value={{ user, setUser, isLogged, setIsLogged, signIn, signUp, logOut, imgUrl, setImgUrl, }}
        >
            {children}
        </UserContext.Provider>
    );
};
