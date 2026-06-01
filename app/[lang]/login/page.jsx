import { getDictionary } from '@/lib/get-dictionary';
import LoginClient from './LoginClient';

export default async function LoginPage({ params }) {
    // En Next.js 15+, params es una Promise, por eso usamos await
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <main>
            {/* Pasamos el diccionario y el idioma al componente de cliente */}
            <LoginClient dict={dict} lang={lang} />
        </main>
    );
}