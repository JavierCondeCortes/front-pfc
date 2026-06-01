import { getDictionary } from '@/lib/get-dictionary';
import RegisterClient from './registerClient';

export default async function RegisterPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    // Usamos localhost para evitar algunos bloqueos de navegador
    const apiUrl = "http://127.0.0.1:8000/api/register";

    return (
        <RegisterClient 
            dict={dict} 
            lang={lang} 
            apiUrl={apiUrl} 
        />
    );
}