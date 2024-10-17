"use client";
import { Field, Form, Formik, ErrorMessage } from 'formik';
import { loginValidationSchema } from '@/utils/loginValidationSchema';
import { useRouter } from 'next/navigation';
import { ILogin } from '@/interfaces/interfaces';
import { useContext } from 'react';
import { UserContext } from '@/context/user';

export default function LoginForm() {
  const router = useRouter();
  const { signIn } = useContext(UserContext);

  const initialValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values: ILogin, { resetForm }: { resetForm: () => void }) => {
    const res = await signIn(values);

    if (res) {
      alert('Usuario logueado correctamente!');
      router.push('/home');
    } else {
      alert('Email o contraseña incorrectos!');
    }
    resetForm();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ isValid, dirty }) => (
        <Form>
          <div className="mb-4">
            <Field
              type="email"
              name="email"
              placeholder="Correo electrónico"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
          </div>
          <div className="mb-4">
            <Field
              type="password"
              name="password"
              placeholder="Contraseña"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
          </div>
          <button
            type="submit"
            disabled={!isValid || !dirty}
            className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-800"
          >
            Iniciar Sesión
          </button>
        </Form>
      )}
    </Formik>
  );
}
