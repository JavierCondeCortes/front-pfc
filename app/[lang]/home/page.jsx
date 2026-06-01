import { getDictionary } from '@/lib/get-dictionary';
import LandingClient from './landingClient';

export default async function LandingPage({ params }) {
    // 1. Extraemos el idioma de los parámetros (Next.js 15 requiere await)
    const { lang } = await params;

    // 2. Obtenemos las traducciones correspondientes
    const dict = await getDictionary(lang);

    // 3. Renderizamos el componente de cliente pasándole los datos
    return (
        <LandingClient 
            dict={dict} 
            lang={lang} 
        />
    );
}